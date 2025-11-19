# Python API Screenshot Fix

## Issues Fixed

### 1. ✅ UI Issue - "Analyzing..." Indicator Removed
The `camera-monitor.tsx` component no longer displays the "Analyzing..." text in the header. Students will no longer know when the system is actively analyzing their video feed.

### 2. ⚠️ Python API Issue - Screenshot on Every Frame

**Problem:** The Python API is currently taking a screenshot on EVERY analysis cycle, even when no suspicious activity is detected.

**Required Fix:** Screenshots should ONLY be taken when `cheating_detected` is `True`.

---

## Python API Code Fix

You need to modify your Python API file (likely `api.py` or similar) in the `face-detection-backend` folder.

### Find This Pattern:

Look for code in your `/analyze-frame` endpoint that looks similar to this:

```python
@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    # ... decode frame logic ...
    
    # Face detection logic
    result = detect_face(frame)
    
    # ❌ WRONG: Saving frame BEFORE checking if cheating detected
    filename = f"{reason}_{timestamp}.jpg"
    filepath = os.path.join(student_folder, filename)
    cv2.imwrite(filepath, frame)  # THIS IS THE PROBLEM
    
    result['frame_saved'] = True
    
    return jsonify(result)
```

### Change It To:

```python
@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    # ... decode frame logic ...
    
    # Face detection logic
    result = detect_face(frame)
    
    # ✅ CORRECT: Only save frame if cheating detected
    frame_saved = False
    
    if result['cheating_detected']:
        # Save suspicious frame
        reason = result['reason']
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{reason}_{timestamp}.jpg"
        
        # Create student folder if it doesn't exist
        student_id = data.get('student_id', 'UNKNOWN')
        student_folder = os.path.join('suspicious_frames', student_id)
        os.makedirs(student_folder, exist_ok=True)
        
        filepath = os.path.join(student_folder, filename)
        cv2.imwrite(filepath, frame)
        frame_saved = True
        
        print(f"🚨 Suspicious frame saved: {filepath}")
    
    result['frame_saved'] = frame_saved
    
    return jsonify(result)
```

### Key Changes:

1. **Move the screenshot code INSIDE the `if result['cheating_detected']:` block**
2. **Initialize `frame_saved = False` at the start**
3. **Only set `frame_saved = True` when actually saving a frame**
4. **Ensure the folder creation is inside the suspicious activity block**

---

## Complete Example Python API Structure

Here's how your `/analyze-frame` endpoint should be structured:

```python
import cv2
import numpy as np
from datetime import datetime
from flask import Flask, jsonify, request
import base64
import os

app = Flask(__name__)

# Face detection setup
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

SUSPICIOUS_FRAMES_DIR = 'suspicious_frames'

def detect_face(frame):
    """
    Detect faces and determine if cheating behavior
    Returns dict with detection results
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    result = {
        'face_detected': False,
        'fully_visible': False,
        'cheating_detected': False,
        'face_coverage': 0.0,
        'reason': 'unknown'
    }
    
    if len(faces) == 0:
        result['cheating_detected'] = True
        result['reason'] = 'face_not_detected'
    elif len(faces) > 1:
        result['cheating_detected'] = True
        result['reason'] = 'multiple_faces_detected'
        result['face_detected'] = True
    else:
        # Single face detected
        x, y, w, h = faces[0]
        result['face_detected'] = True
        result['face_location'] = {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
        
        # Calculate face coverage
        frame_area = frame.shape[0] * frame.shape[1]
        face_area = w * h
        result['face_coverage'] = face_area / frame_area
        
        # Check if face is too small or at edge (partially visible)
        if result['face_coverage'] < 0.05:  # Less than 5% of frame
            result['cheating_detected'] = True
            result['reason'] = 'face_out_of_frame'
        elif result['face_coverage'] < 0.10:  # Less than 10% of frame
            result['cheating_detected'] = True
            result['reason'] = 'face_partially_visible'
        else:
            result['fully_visible'] = True
            result['reason'] = 'monitoring_ok'
    
    return result

@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        data = request.json
        frame_base64 = data.get('frame')
        student_id = data.get('student_id', 'UNKNOWN')
        
        if not frame_base64:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_base64)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid frame data'}), 400
        
        # Perform face detection
        result = detect_face(frame)
        
        # ✅ ONLY save frame if suspicious activity detected
        frame_saved = False
        
        if result['cheating_detected']:
            # Create student-specific folder
            student_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, student_id)
            os.makedirs(student_folder, exist_ok=True)
            
            # Generate filename with timestamp and reason
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            reason = result['reason']
            filename = f"{reason}_{timestamp}.jpg"
            filepath = os.path.join(student_folder, filename)
            
            # Save the frame
            cv2.imwrite(filepath, frame)
            frame_saved = True
            
            print(f"🚨 SUSPICIOUS ACTIVITY: {reason}")
            print(f"📸 Frame saved: {filepath}")
        
        # Add frame_saved to result
        result['frame_saved'] = frame_saved
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error in analyze_frame: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'Cheating Detection API'
    })

if __name__ == '__main__':
    # Create suspicious frames directory
    os.makedirs(SUSPICIOUS_FRAMES_DIR, exist_ok=True)
    print("🚀 Starting Cheating Detection API...")
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## Testing the Fix

After applying the fix:

1. **Start the Python API:**
   ```bash
   cd ..\face-detection-backend
   python api.py
   ```

2. **Start the desktop app:**
   ```bash
   cd desktop
   npm run electron:dev
   ```

3. **Test normal behavior:**
   - Sit normally in front of camera
   - Check that NO files are created in `suspicious_frames/STUDENT_001/`
   - Terminal should NOT show "Frame saved" messages

4. **Test suspicious behavior:**
   - Move your face out of frame
   - Cover your face
   - Look away
   - Check that FILES ARE NOW created in `suspicious_frames/STUDENT_001/`
   - Terminal SHOULD show "🚨 SUSPICIOUS ACTIVITY" and "📸 Frame saved" messages

---

## Expected Behavior After Fix

### Normal Monitoring (No Cheating):
- ✅ Face detected and visible
- ✅ Green border shown
- ✅ NO screenshots taken
- ✅ NO files created
- ✅ Student sees: "✓ Monitoring Active"
- ✅ No "Analyzing..." text visible

### Suspicious Activity Detected:
- 🚨 Red overlay shown
- 🚨 Warning message displayed
- 🚨 Screenshot saved to disk
- 🚨 File created: `suspicious_frames/STUDENT_001/[reason]_[timestamp].jpg`
- 🚨 Warning logged to exam session

---

## Summary of Both Fixes

| Issue | Location | Fix Applied |
|-------|----------|-------------|
| "Analyzing..." indicator visible | `camera-monitor.tsx` | ✅ Removed - Students can't see when system analyzes |
| Screenshot on every frame | Python API `api.py` | ⚠️ **You need to apply** - Move `cv2.imwrite()` inside `if cheating_detected` block |

The UI fix has been applied. **Please apply the Python API fix as described above** to complete the security improvements.
