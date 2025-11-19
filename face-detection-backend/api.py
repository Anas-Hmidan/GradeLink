from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
from datetime import datetime
import threading
import time
import logging
from logging.handlers import RotatingFileHandler
import sys

# Import configuration
from config import (
    HOST, PORT, DEBUG_MODE, SUSPICIOUS_FRAMES_DIR, LOG_DIR,
    FACE_CONFIDENCE_THRESHOLD, FACE_VISIBILITY_THRESHOLD, EDGE_MARGIN_PIXELS,
    FRAME_SAVE_COOLDOWN, MIN_SUSPICIOUS_DURATION, FRAME_PROCESS_INTERVAL,
    MIN_FACE_SIZE, SCALE_FACTOR, MIN_NEIGHBORS,
    LOG_LEVEL, LOG_MAX_BYTES, LOG_BACKUP_COUNT,
    MAX_FRAME_SIZE_MB, MAX_BATCH_SIZE, ALLOWED_ORIGINS,
    ensure_directories, get_config_summary
)

app = Flask(__name__)

# Configure CORS
if ALLOWED_ORIGINS == '*':
    CORS(app)
else:
    CORS(app, origins=ALLOWED_ORIGINS.split(','))

# Setup logging
def setup_logging():
    """Configure application logging with rotating file handler"""
    ensure_directories()
    
    # Create logger
    logger = logging.getLogger('cheating_detection')
    logger.setLevel(getattr(logging, LOG_LEVEL))
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    
    # File handler with rotation
    log_file = os.path.join(LOG_DIR, 'api.log')
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=LOG_MAX_BYTES,
        backupCount=LOG_BACKUP_COUNT
    )
    file_handler.setLevel(getattr(logging, LOG_LEVEL))
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    file_handler.setFormatter(file_formatter)
    
    # Add handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

logger = setup_logging()

# Track last save time and issue start time per student
last_save_time = {}  # {student_id: timestamp}
issue_start_time = {}  # {student_id: {reason: timestamp}}
frame_counter = {}  # {student_id: counter}

# Load pre-trained face detector
try:
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    if face_cascade.empty():
        logger.error("Failed to load face cascade classifier")
        raise RuntimeError("Face cascade classifier not loaded")
    logger.info("Face cascade classifier loaded successfully")
except Exception as e:
    logger.critical(f"Failed to initialize face detection: {e}")
    raise

def save_suspicious_frame(frame, reason, student_id=None):
    """Save suspicious frame to disk with cooldown and persistence check"""
    current_time = time.time()
    student_key = str(student_id) if student_id else "unknown"
    
    logger.info(f"📸 Attempting to save frame for {student_key} - Reason: {reason}")
    
    # Check cooldown - don't save if we saved recently for this student
    if student_key in last_save_time:
        time_since_last_save = current_time - last_save_time[student_key]
        if time_since_last_save < FRAME_SAVE_COOLDOWN:
            logger.info(f"⏳ Cooldown active for {student_key}: {time_since_last_save:.1f}s < {FRAME_SAVE_COOLDOWN}s")
            return None  # Skip saving, too soon
    
    # Check if issue is persistent (not just a momentary glitch)
    if student_key not in issue_start_time:
        issue_start_time[student_key] = {}
    
    if reason not in issue_start_time[student_key]:
        # First time seeing this issue, record start time
        issue_start_time[student_key][reason] = current_time
        logger.info(f"⏱️  First occurrence of '{reason}' for {student_key}, tracking persistence (need {MIN_SUSPICIOUS_DURATION}s)")
        return None  # Don't save yet, wait to see if it persists
    
    issue_duration = current_time - issue_start_time[student_key][reason]
    if issue_duration < MIN_SUSPICIOUS_DURATION:
        logger.info(f"⏱️  Issue '{reason}' for {student_key}: {issue_duration:.1f}s / {MIN_SUSPICIOUS_DURATION}s (not persistent yet)")
        return None  # Issue hasn't persisted long enough
    
    # Issue is persistent and cooldown has passed, save it
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        student_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, student_key)
        os.makedirs(student_folder, exist_ok=True)
        
        filename = f"{reason}_{timestamp}.jpg"
        filepath = os.path.join(student_folder, filename)
        
        logger.info(f"💾 Writing frame to: {filepath}")
        success = cv2.imwrite(filepath, frame)
        if not success:
            logger.error(f"❌ Failed to write frame to {filepath}")
            return None
            
        last_save_time[student_key] = current_time
        logger.warning(f"🚨 SUSPICIOUS ACTIVITY SAVED: {student_key} - {reason} - Persisted for {issue_duration:.1f}s")
        logger.warning(f"📁 Frame saved to: {filepath}")
        
        return filepath
    except Exception as e:
        logger.error(f"❌ Error saving suspicious frame for {student_key}: {e}", exc_info=True)
        return None

def clear_student_issue(student_id, reason=None):
    """Clear issue tracking when student returns to normal"""
    student_key = str(student_id) if student_id else "unknown"
    if student_key in issue_start_time:
        if reason:
            issue_start_time[student_key].pop(reason, None)
        else:
            issue_start_time[student_key] = {}

def detect_face_and_validate(frame_data):
    """
    Detect face in frame and validate visibility
    Returns: {
        'face_detected': bool,
        'fully_visible': bool,
        'face_coverage': float (0-1),
        'face_location': (x, y, w, h) or None,
        'cheating_detected': bool,
        'reason': str
    }
    """
    try:
        # Convert base64 to image
        nparr = np.frombuffer(base64.b64decode(frame_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {
                'face_detected': False,
                'fully_visible': False,
                'cheating_detected': True,
                'reason': 'invalid_frame',
                'face_coverage': 0
            }
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        h, w = frame.shape[:2]
        frame_area = h * w
        
        # Detect faces (balanced for performance and accuracy)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=SCALE_FACTOR,
            minNeighbors=MIN_NEIGHBORS,
            minSize=MIN_FACE_SIZE
        )
        
        # No face detected
        if len(faces) == 0:
            return {
                'face_detected': False,
                'fully_visible': False,
                'cheating_detected': True,
                'reason': 'face_not_detected',
                'face_coverage': 0,
                'frame': frame
            }
        
        # Multiple faces detected (cheating attempt)
        if len(faces) > 1:
            return {
                'face_detected': True,
                'fully_visible': False,
                'cheating_detected': True,
                'reason': 'multiple_faces_detected',
                'face_coverage': 0,
                'frame': frame,
                'face_count': len(faces)
            }
        
        # Single face detected - validate visibility
        x, y, face_w, face_h = faces[0]
        face_area = face_w * face_h
        face_coverage = face_area / frame_area
        
        # Check if face is at frame edges (partially out of frame)
        # More lenient edge detection - only flag if truly at edge
        is_at_edge = (x < EDGE_MARGIN_PIXELS or 
                      y < EDGE_MARGIN_PIXELS or 
                      (x + face_w) > (w - EDGE_MARGIN_PIXELS) or 
                      (y + face_h) > (h - EDGE_MARGIN_PIXELS))
        
        # Much more lenient visibility check
        # Only flag if face is REALLY small (far away) or actually out of frame
        is_fully_visible = (
            face_coverage >= FACE_VISIBILITY_THRESHOLD and 
            not is_at_edge
        )
        
        # Additional check: If face coverage is reasonable (>5%), consider it OK even if at edge slightly
        # This prevents false positives for normal sitting positions
        if face_coverage >= 0.05 and not is_at_edge:
            is_fully_visible = True
        
        result = {
            'face_detected': True,
            'fully_visible': is_fully_visible,
            'face_coverage': float(face_coverage),
            'face_location': {'x': int(x), 'y': int(y), 'w': int(face_w), 'h': int(face_h)},
            'cheating_detected': not is_fully_visible,
            'reason': 'ok' if is_fully_visible else ('face_out_of_frame' if is_at_edge else 'face_partially_visible'),
            'frame': frame
        }
        
        return result
        
    except Exception as e:
        return {
            'face_detected': False,
            'fully_visible': False,
            'cheating_detected': True,
            'reason': f'error: {str(e)}',
            'face_coverage': 0
        }

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint with configuration info"""
    return jsonify({
        'status': 'ok',
        'service': 'Cheating Detection API',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'configuration': get_config_summary()
    })

@app.route('/test-detection', methods=['POST'])
def test_detection():
    """Test endpoint - always processes frame (ignores interval) for testing"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        frame_b64 = data.get('frame')
        
        if not frame_b64:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Validate frame size
        frame_size_mb = len(frame_b64) / (1024 * 1024)
        if frame_size_mb > MAX_FRAME_SIZE_MB:
            return jsonify({'error': f'Frame size exceeds {MAX_FRAME_SIZE_MB}MB limit'}), 413
        
        result = detect_face_and_validate(frame_b64)
        
        # Remove frame from response
        if 'frame' in result:
            del result['frame']
        
        result['test_mode'] = True
        result['message'] = 'Frame processed in test mode (no skipping, no saving)'
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    """
    Analyze a single frame for cheating detection
    
    Request body:
    {
        'frame': base64_encoded_image,
        'student_id': optional_student_identifier,
        'session_id': optional_session_identifier
    }
    
    Response:
    {
        'face_detected': bool,
        'fully_visible': bool,
        'cheating_detected': bool,
        'face_coverage': float,
        'face_location': dict,
        'reason': str,
        'frame_saved': bool (if cheating detected),
        'frame_path': str (if frame was saved),
        'frame_skipped': bool (if frame was not processed due to interval)
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        frame_b64 = data.get('frame')
        student_id = data.get('student_id', 'unknown')
        force_process = data.get('force_process', False)  # Allow override
        
        if not frame_b64:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Validate frame size
        frame_size_mb = len(frame_b64) / (1024 * 1024)
        if frame_size_mb > MAX_FRAME_SIZE_MB:
            logger.warning(f"Frame size exceeds limit: {frame_size_mb:.2f}MB")
            return jsonify({'error': f'Frame size exceeds {MAX_FRAME_SIZE_MB}MB limit'}), 413
        
        student_key = str(student_id)
        
        # Frame skipping for performance - only process every Nth frame
        if not force_process and FRAME_PROCESS_INTERVAL > 1:
            if student_key not in frame_counter:
                frame_counter[student_key] = 1  # Start at 1 so first frame is processed
            else:
                frame_counter[student_key] += 1
            
            if frame_counter[student_key] % FRAME_PROCESS_INTERVAL != 0:
                # Skip this frame, return last known state or assume OK
                return jsonify({
                    'frame_skipped': True,
                    'face_detected': True,
                    'fully_visible': True,
                    'cheating_detected': False,
                    'reason': 'frame_skipped_for_performance',
                    'message': 'Frame skipped to reduce CPU load'
                })
        
        result = detect_face_and_validate(frame_b64)
        result['frame_skipped'] = False
        
        # Log detection result
        logger.info(f"👤 Student {student_id}: face_detected={result.get('face_detected')}, cheating={result.get('cheating_detected')}, reason={result.get('reason')}, coverage={result.get('face_coverage', 0):.2%}")
        
        # Clear issue tracking if everything is OK
        if not result['cheating_detected']:
            clear_student_issue(student_id)
            logger.debug(f"✅ Student {student_id}: monitoring normal")
        else:
            logger.info(f"⚠️  Student {student_id}: Suspicious activity detected - {result.get('reason')}")
        
        # 🔒 CRITICAL: Save suspicious frame ONLY if cheating detected
        frame_saved = False
        frame_path = None
        
        if result['cheating_detected'] and 'frame' in result:
            logger.info(f"🔍 Cheating detected for {student_id}, attempting to save frame...")
            try:
                frame_path = save_suspicious_frame(
                    result['frame'],
                    result['reason'],
                    student_id
                )
                if frame_path:  # Only set to True if actually saved
                    frame_saved = True
                    logger.info(f"✅ Frame successfully saved: {frame_path}")
                else:
                    logger.info(f"⏳ Frame not saved (waiting for persistence or cooldown)")
            except Exception as e:
                logger.error(f"❌ Error saving frame for {student_id}: {e}", exc_info=True)
        
        # Remove frame from response (it's binary data)
        if 'frame' in result:
            del result['frame']
        
        result['frame_saved'] = frame_saved
        if frame_path:
            result['frame_path'] = frame_path
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-student', methods=['POST'])
def check_student():
    """
    Check if a student has any recorded suspicious activities
    
    Request body:
    {
        'student_id': student_identifier
    }
    """
    try:
        data = request.json
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'No student_id provided'}), 400
        
        student_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, str(student_id))
        
        if not os.path.exists(student_folder):
            return jsonify({
                'student_id': student_id,
                'suspicious_activity_count': 0,
                'frames': []
            })
        
        frames = os.listdir(student_folder)
        frame_details = []
        
        for frame_file in frames:
            filepath = os.path.join(student_folder, frame_file)
            if os.path.isfile(filepath):
                frame_details.append({
                    'filename': frame_file,
                    'path': filepath,
                    'timestamp': frame_file.split('_')[1] if '_' in frame_file else 'unknown'
                })
        
        return jsonify({
            'student_id': student_id,
            'suspicious_activity_count': len(frame_details),
            'frames': frame_details
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-frame/<student_id>/<frame_name>', methods=['GET'])
def get_frame(student_id, frame_name):
    """Retrieve a saved suspicious frame image"""
    try:
        filepath = os.path.join(SUSPICIOUS_FRAMES_DIR, str(student_id), frame_name)
        
        # Validate path to prevent directory traversal
        if not os.path.abspath(filepath).startswith(os.path.abspath(SUSPICIOUS_FRAMES_DIR)):
            return jsonify({'error': 'Invalid path'}), 403
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Frame not found'}), 404
        
        return cv2.imread(filepath), 200, {'Content-Type': 'image/jpeg'}
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple frames in batch
    
    Request body:
    {
        'frames': [base64_frame1, base64_frame2, ...],
        'student_id': optional_student_identifier
    }
    """
    try:
        data = request.json
        frames = data.get('frames', [])
        student_id = data.get('student_id', 'unknown')
        
        if not frames:
            return jsonify({'error': 'No frames provided'}), 400
        
        results = []
        cheating_count = 0
        
        for idx, frame_b64 in enumerate(frames):
            result = detect_face_and_validate(frame_b64)
            
            if result['cheating_detected'] and 'frame' in result:
                try:
                    frame_path = save_suspicious_frame(
                        result['frame'],
                        result['reason'],
                        student_id
                    )
                    result['frame_path'] = frame_path
                    cheating_count += 1
                except Exception as e:
                    print(f"Error saving frame: {e}")
            
            if 'frame' in result:
                del result['frame']
            
            result['frame_index'] = idx
            results.append(result)
        
        return jsonify({
            'total_frames': len(frames),
            'cheating_detected_count': cheating_count,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("="*60)
    logger.info("🚀 Starting Cheating Detection API")
    logger.info("="*60)
    logger.info(f"Host: {HOST}")
    logger.info(f"Port: {PORT}")
    logger.info(f"Debug Mode: {DEBUG_MODE}")
    logger.info(f"Log Level: {LOG_LEVEL}")
    logger.info(f"Suspicious frames directory: {os.path.abspath(SUSPICIOUS_FRAMES_DIR)}")
    logger.info(f"Logs directory: {os.path.abspath(LOG_DIR)}")
    logger.info(f"Frame process interval: {FRAME_PROCESS_INTERVAL} (1=all frames)")
    logger.info(f"Screenshot cooldown: {FRAME_SAVE_COOLDOWN}s")
    logger.info(f"Min suspicious duration: {MIN_SUSPICIOUS_DURATION}s")
    logger.info("="*60)
    logger.info("🔒 SECURITY: Screenshots ONLY saved when cheating detected")
    logger.info("="*60)
    
    try:
        app.run(debug=DEBUG_MODE, host=HOST, port=PORT, threaded=True)
    except Exception as e:
        logger.critical(f"Failed to start server: {e}", exc_info=True)
        sys.exit(1)
