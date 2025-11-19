# Cheating Detection API Documentation

## Overview
A Flask-based REST API that detects face visibility in video frames to identify potential cheating attempts during online exams. The API only saves screenshots when suspicious activity is detected, ensuring efficient storage and privacy.

**Version:** 2.0.0

## Key Features

- ✅ **Privacy-First**: Screenshots saved ONLY when suspicious activity detected
- ✅ **Smart Persistence**: Issues must persist for 2+ seconds before saving
- ✅ **Rate Limiting**: Cooldown period between saves per student
- ✅ **Production Logging**: Comprehensive logging with rotation
- ✅ **Configurable**: Environment-based configuration
- ✅ **Performance Optimized**: Frame processing intervals to reduce CPU load

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure (Optional)
Edit `config.py` or set environment variables:

```bash
# Server
export API_HOST=0.0.0.0
export API_PORT=5000
export DEBUG_MODE=False

# Detection
export FACE_VISIBILITY_THRESHOLD=0.7
export FRAME_SAVE_COOLDOWN=5
export MIN_SUSPICIOUS_DURATION=2

# Performance
export FRAME_PROCESS_INTERVAL=1  # 1=all frames, 2=every other frame
```

### 3. Start the API
```bash
python api.py
```

The API will run on `http://localhost:5000`

## Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `FACE_VISIBILITY_THRESHOLD` | 0.08 | Minimum face coverage (8%) - very lenient for normal use |
| `FRAME_SAVE_COOLDOWN` | 5s | Minimum time between saving frames for same student |
| `MIN_SUSPICIOUS_DURATION` | 3s | How long issue must persist before saving |
| `FRAME_PROCESS_INTERVAL` | 1 | Process every Nth frame (1=all, 2=every other) |
| `MAX_FRAME_SIZE_MB` | 5MB | Maximum frame size accepted |
| `MAX_BATCH_SIZE` | 100 | Maximum frames in batch analysis |

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running and get configuration info.

**Response:**
```json
{
  "status": "ok",
  "service": "Cheating Detection API",
  "version": "2.0.0",
  "timestamp": "2025-11-19T10:30:00.000000",
  "configuration": {
    "host": "0.0.0.0",
    "port": 5000,
    "debug": false,
    "face_visibility_threshold": 0.7,
    "frame_save_cooldown": 5,
    "min_suspicious_duration": 2,
    "frame_process_interval": 1,
    "log_level": "INFO"
  }
}
```

---

### 2. Analyze Single Frame
**POST** `/analyze-frame`

Analyze a single camera frame for cheating detection. **Screenshots are saved ONLY when `cheating_detected` is true.**

**Request:**
```json
{
  "frame": "base64_encoded_image_data",
  "student_id": "STU001",
  "force_process": false
}
```

**Response:**
```json
{
  "face_detected": true,
  "fully_visible": true,
  "cheating_detected": false,
  "face_coverage": 0.85,
  "face_location": {
    "x": 150,
    "y": 100,
    "w": 200,
    "h": 250
  },
  "reason": "ok",
  "frame_saved": false,
  "frame_skipped": false
}
```

**Response (Suspicious Activity - Screenshot Saved):**
```json
{
  "face_detected": false,
  "fully_visible": false,
  "cheating_detected": true,
  "face_coverage": 0.0,
  "reason": "face_not_detected",
  "frame_saved": true,
  "frame_path": "suspicious_frames/STU001/face_not_detected_20251119_103045_123456.jpg",
  "frame_skipped": false
}
```

**Cheating Detection Reasons:**
- `ok` - Everything normal, student visible
- `face_not_detected` - No face found in frame
- `face_out_of_frame` - Face is at the edges of the frame
- `face_partially_visible` - Face is not fully visible (< 70% coverage)
- `multiple_faces_detected` - More than one face in frame (possible helper)

**Important Notes:**
- 🔒 Screenshots are **ONLY** saved when `cheating_detected` is `true`
- Issues must persist for at least 3 seconds before saving (prevents false positives)
- There's a 5-second cooldown between saves per student (prevents spam)
- If `frame_skipped` is `true`, the frame wasn't processed (performance optimization)
- Face coverage >5% with face not at edge = considered OK (lenient for normal use)

---

### 3. Batch Analyze Frames
**POST** `/batch-analyze`

Analyze multiple frames at once.

**Request:**
\`\`\`json
{
  "frames": ["base64_frame1", "base64_frame2", ...],
  "student_id": "STU001"
}
\`\`\`

**Response:**
\`\`\`json
{
  "total_frames": 5,
  "cheating_detected_count": 1,
  "results": [
    {
      "frame_index": 0,
      "face_detected": true,
      "fully_visible": true,
      "cheating_detected": false,
      "face_coverage": 0.85,
      "reason": "ok"
    },
    ...
  ]
}
\`\`\`

---

### 4. Check Student Suspicious Activity
**POST** `/check-student`

Retrieve all suspicious frames captured for a student.

**Request:**
\`\`\`json
{
  "student_id": "STU001"
}
\`\`\`

**Response:**
\`\`\`json
{
  "student_id": "STU001",
  "suspicious_activity_count": 3,
  "frames": [
    {
      "filename": "face_out_of_frame_20240115_143022_123456.jpg",
      "path": "suspicious_frames/STU001/...",
      "timestamp": "143022"
    },
    ...
  ]
}
\`\`\`

---

### 5. Retrieve Suspicious Frame
**GET** `/get-frame/<student_id>/<frame_name>`

Download a specific suspicious frame image.

**Example:**
\`\`\`
GET /get-frame/STU001/face_out_of_frame_20240115_143022_123456.jpg
\`\`\`

---

## Integration with Desktop App

### Python Example:
\`\`\`python
import requests
import cv2
import base64

def send_frame_for_analysis(frame_bgr, student_id):
    _, buffer = cv2.imencode('.jpg', frame_bgr)
    frame_b64 = base64.b64encode(buffer).decode('utf-8')
    
    response = requests.post(
        'http://localhost:5000/analyze-frame',
        json={
            'frame': frame_b64,
            'student_id': student_id
        }
    )
    
    return response.json()
\`\`\`

### JavaScript/Node.js Example:
\`\`\`javascript
async function analyzeFrame(canvas, studentId) {
  const frameData = canvas.toDataURL('image/jpeg');
  const frame = frameData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
  
  const response = await fetch('http://localhost:5000/analyze-frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frame: frame,
      student_id: studentId
    })
  });
  
  return await response.json();
}
\`\`\`

---

## Configuration

Edit the constants in `api.py`:

### Detection Settings
\`\`\`python
FACE_VISIBILITY_THRESHOLD = 0.7  # Minimum 70% of face visible
FACE_CONFIDENCE_THRESHOLD = 0.5  # Face detection confidence
SUSPICIOUS_FRAMES_DIR = "suspicious_frames"  # Where to save frames
\`\`\`

### Performance & CPU Optimization Settings
\`\`\`python
FRAME_SAVE_COOLDOWN = 5  # Seconds between saving frames for same student
MIN_SUSPICIOUS_DURATION = 2  # Seconds - only save if issue persists
FRAME_PROCESS_INTERVAL = 3  # Process every Nth frame (1=all, 2=every other, 3=every third)
\`\`\`

**Important Performance Notes:**
- **Frame Skipping**: By default, only every 3rd frame is processed to reduce CPU load by ~66%
- **Cooldown Period**: Prevents saving multiple screenshots within 5 seconds for the same student
- **Persistence Check**: Only saves frames if suspicious activity lasts 2+ seconds (prevents false positives)
- **Recommended**: Keep `FRAME_PROCESS_INTERVAL=3` for laptops to prevent overheating
- **For High-End PCs**: You can reduce to `FRAME_PROCESS_INTERVAL=2` or `1` for more frequent checks

---

## File Structure

\`\`\`
├── api.py                      # Main API server
├── requirements.txt            # Python dependencies
├── scripts/
│   └── test_api.py            # Test script
├── API_DOCUMENTATION.md       # This file
└── suspicious_frames/         # Saved suspicious frames (created at runtime)
    └── STU001/
        ├── face_out_of_frame_*.jpg
        └── multiple_faces_detected_*.jpg
\`\`\`

---

## Notes

- **CPU Optimization**: The API processes only every 3rd frame by default to prevent laptop overheating
- **Smart Frame Saving**: Only saves screenshots when suspicious activity persists for 2+ seconds
- **Cooldown Protection**: Maximum one screenshot per 5 seconds per student to prevent spam
- Frames are stored in `suspicious_frames/{student_id}/` with timestamps
- The API uses Haar Cascade for face detection (fast and reliable)
- All timestamps are in `YYYYMMDD_HHMMSS_microseconds` format
- CORS is enabled for cross-origin requests
- **If laptop gets hot**: Increase `FRAME_PROCESS_INTERVAL` to 5 or higher in `api.py`
