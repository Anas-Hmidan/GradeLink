"""
Configuration file for Cheating Detection API
Centralized settings for easy deployment and environment management
"""
import os

# Server Configuration
HOST = os.getenv('API_HOST', '0.0.0.0')
PORT = int(os.getenv('API_PORT', 5000))
DEBUG_MODE = os.getenv('DEBUG_MODE', 'False').lower() == 'true'

# Storage Configuration
SUSPICIOUS_FRAMES_DIR = os.getenv('SUSPICIOUS_FRAMES_DIR', 'suspicious_frames')
LOG_DIR = os.getenv('LOG_DIR', 'logs')

# Face Detection Thresholds
FACE_CONFIDENCE_THRESHOLD = float(os.getenv('FACE_CONFIDENCE_THRESHOLD', '0.5'))
FACE_VISIBILITY_THRESHOLD = float(os.getenv('FACE_VISIBILITY_THRESHOLD', '0.08'))  # 8% minimum - very lenient for normal use
EDGE_MARGIN_PIXELS = int(os.getenv('EDGE_MARGIN_PIXELS', '5'))  # Distance from frame edge to consider "out of frame"

# Performance & Rate Limiting
FRAME_SAVE_COOLDOWN = int(os.getenv('FRAME_SAVE_COOLDOWN', '5'))  # seconds between saving frames for same student
MIN_SUSPICIOUS_DURATION = int(os.getenv('MIN_SUSPICIOUS_DURATION', '1'))  # seconds - only save if issue persists (reduced to 1 for better responsiveness)
FRAME_PROCESS_INTERVAL = int(os.getenv('FRAME_PROCESS_INTERVAL', '1'))  # process every Nth frame (1=all frames)
# Set to 1 for reliable detection. If system overheats, increase to 2 or 3

# Detection Parameters
MIN_FACE_SIZE = (40, 40)  # Minimum face size to detect in pixels
SCALE_FACTOR = 1.1  # How much the image size is reduced at each image scale (lower = more accurate but slower)
MIN_NEIGHBORS = 3  # How many neighbors each candidate rectangle should have (lower = more detections, may have false positives)

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', '10485760'))  # 10MB
LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', '5'))

# Security Configuration
MAX_FRAME_SIZE_MB = int(os.getenv('MAX_FRAME_SIZE_MB', '5'))
MAX_BATCH_SIZE = int(os.getenv('MAX_BATCH_SIZE', '100'))
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*')  # CORS origins

# Directory Creation
def ensure_directories():
    """Create necessary directories if they don't exist"""
    os.makedirs(SUSPICIOUS_FRAMES_DIR, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

# Configuration Summary
def get_config_summary():
    """Return configuration summary for health checks"""
    return {
        'host': HOST,
        'port': PORT,
        'debug': DEBUG_MODE,
        'face_visibility_threshold': FACE_VISIBILITY_THRESHOLD,
        'frame_save_cooldown': FRAME_SAVE_COOLDOWN,
        'min_suspicious_duration': MIN_SUSPICIOUS_DURATION,
        'frame_process_interval': FRAME_PROCESS_INTERVAL,
        'log_level': LOG_LEVEL
    }
