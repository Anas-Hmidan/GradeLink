# Cheating Detection API 🔍

A production-ready Flask REST API that detects suspicious behavior during online exams by analyzing video frames. **Screenshots are saved ONLY when suspicious activity is detected**, ensuring privacy and efficient storage.

## 🎯 Key Features

- **Privacy-First Design**: Screenshots captured only when cheating is detected
- **Smart Persistence**: Issues must persist 2+ seconds to avoid false positives
- **Rate Limiting**: 5-second cooldown between saves per student
- **Production Logging**: Rotating logs with configurable levels
- **Highly Configurable**: Environment-based configuration
- **Performance Optimized**: Frame processing intervals to reduce CPU load
- **Comprehensive Testing**: Automated test suite validates behavior

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- pip
- Webcam or video source

### Installation

1. **Clone the repository**
   ```bash
   cd face-detection-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the API**
   ```bash
   python api.py
   ```

The API will start on `http://localhost:5000`

## 🧪 Testing

Run the comprehensive test suite:

```bash
python scripts\test_api.py
```

This validates:
- ✅ Health check endpoint
- ✅ Normal monitoring (no screenshots)
- ✅ Suspicious activity (screenshots saved)
- ✅ Multiple frames (no spam)
- ✅ Student check endpoint

## 📚 API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint reference.

### Quick Example

**Analyze a frame:**
```python
import requests
import base64

# Read and encode image
with open('frame.jpg', 'rb') as f:
    frame_b64 = base64.b64encode(f.read()).decode('utf-8')

# Send to API
response = requests.post(
    'http://localhost:5000/analyze-frame',
    json={
        'frame': frame_b64,
        'student_id': 'STUDENT_001'
    }
)

result = response.json()
print(f"Cheating detected: {result['cheating_detected']}")
print(f"Screenshot saved: {result['frame_saved']}")
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Server
API_HOST=0.0.0.0
API_PORT=5000
DEBUG_MODE=False

# Detection
FACE_VISIBILITY_THRESHOLD=0.7
MIN_SUSPICIOUS_DURATION=2
FRAME_SAVE_COOLDOWN=5

# Performance
FRAME_PROCESS_INTERVAL=1  # 1=all frames, 2=every other
```

### Key Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `FACE_VISIBILITY_THRESHOLD` | 0.08 | Minimum 8% face coverage (very lenient) |
| `MIN_SUSPICIOUS_DURATION` | 3s | How long issue must persist |
| `FRAME_SAVE_COOLDOWN` | 5s | Time between saves per student |
| `FRAME_PROCESS_INTERVAL` | 1 | Process every Nth frame |

## 🔒 How Screenshots Work

```python
# This is the critical logic
if result['cheating_detected'] and 'frame' in result:
    # Only save if issue persists AND cooldown passed
    frame_path = save_suspicious_frame(
        result['frame'],
        result['reason'],
        student_id
    )
```

**Screenshots are saved when:**
1. ✅ `cheating_detected` is `True`
2. ✅ Issue persists for 3+ seconds (not a glitch)
3. ✅ Cooldown period has passed (prevents spam)

**Smart Detection Logic:**
- Face coverage >5% AND not at edge = OK (normal behavior)
- This allows students to sit at various distances
- Natural head movements won't trigger alerts

**Detection Reasons:**
- `face_not_detected` - No face visible
- `face_out_of_frame` - Face at frame edges
- `face_partially_visible` - Face coverage < 70%
- `multiple_faces_detected` - Multiple people detected

## 📊 Monitoring

### View Logs
```bash
# Windows
Get-Content logs\api.log -Wait -Tail 20

# Linux/Mac
tail -f logs/api.log
```

### Check Suspicious Activities
```bash
ls suspicious_frames/STUDENT_001/
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🏗️ Project Structure

```
face-detection-backend/
├── api.py                      # Main Flask application
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── API_DOCUMENTATION.md       # Complete API reference
├── IMPROVEMENTS.md            # Enhancement details
├── logs/                      # Log files (auto-created)
│   └── api.log
├── suspicious_frames/         # Screenshots (ONLY when cheating)
│   └── STUDENT_001/
│       ├── face_not_detected_20251119_103045.jpg
│       └── multiple_faces_20251119_103150.jpg
└── scripts/
    └── test_api.py           # Test suite
```

## 🚀 Production Deployment

### Using Gunicorn (Recommended)

1. **Install gunicorn:**
   ```bash
   pip install gunicorn
   ```

2. **Run with multiple workers:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 api:app
   ```

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "api:app"]
```

### Environment Configuration

**Development:**
```env
DEBUG_MODE=True
LOG_LEVEL=DEBUG
FRAME_PROCESS_INTERVAL=1
```

**Production:**
```env
DEBUG_MODE=False
LOG_LEVEL=WARNING
FRAME_PROCESS_INTERVAL=2
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔧 Troubleshooting

### API won't start
- Check if port 5000 is available
- Verify Python version (3.7+)
- Check logs in `logs/api.log`

### Face detection not working
- Ensure OpenCV is properly installed
- Check lighting conditions
- Verify webcam permissions

### Screenshots not saving
- Check `suspicious_frames/` directory permissions
- Review logs for errors
- Verify issue persists for 2+ seconds

## 📈 Performance Tuning

### Reduce CPU usage:
```env
FRAME_PROCESS_INTERVAL=2  # Process every other frame
```

### Adjust detection sensitivity:
```env
FACE_VISIBILITY_THRESHOLD=0.6  # More lenient (60%)
MIN_SUSPICIOUS_DURATION=3      # Wait longer (3s)
```

### Increase rate limiting:
```env
FRAME_SAVE_COOLDOWN=10  # 10 seconds between saves
```

## 🤝 Integration Examples

### React/JavaScript
```javascript
async function analyzeFrame(canvas, studentId) {
  const frameData = canvas.toDataURL('image/jpeg').split(',')[1];
  
  const response = await fetch('http://localhost:5000/analyze-frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frame: frameData,
      student_id: studentId
    })
  });
  
  return await response.json();
}
```

### Python
```python
import cv2
import base64
import requests

cap = cv2.VideoCapture(0)
ret, frame = cap.read()

_, buffer = cv2.imencode('.jpg', frame)
frame_b64 = base64.b64encode(buffer).decode('utf-8')

response = requests.post(
    'http://localhost:5000/analyze-frame',
    json={'frame': frame_b64, 'student_id': 'STU001'}
)
```

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- OpenCV for face detection
- Flask for web framework
- All contributors and testers

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Made with ❤️ for academic integrity**
