# Exam Monitoring Desktop App - Python API Integration

## ✅ What Changed

Your app now uses the **Python Face Detection Backend** instead of face-api.js in the browser!

### Benefits:
- ✅ **More Accurate** - Uses OpenCV Haar Cascade (proven computer vision)
- ✅ **Automatic Frame Saving** - Suspicious frames saved to disk for review
- ✅ **Better Performance** - Python backend handles heavy processing
- ✅ **Detailed Detection** - Face visibility percentage, exact location
- ✅ **Production Ready** - Scalable backend API

## 🚀 How to Run

### Option 1: Automatic Startup (Recommended)
```bash
# From the desktop folder
start-app.bat
```

This will:
1. Start the Python API server (port 5000)
2. Wait for it to be ready
3. Start the Electron desktop app
4. Connect them automatically

### Option 2: Manual Startup

**Terminal 1 - Start Python API:**
```bash
cd ..\face-detection-backend
python api.py
```

**Terminal 2 - Start Desktop App:**
```bash
cd desktop
npm run electron:dev
```

## 📋 Prerequisites

### 1. Python Backend
```bash
cd ..\face-detection-backend
pip install -r requirements.txt
```

### 2. Desktop App Dependencies
```bash
cd desktop
npm install
```

## 🎯 What the App Does Now

### Face Detection Modes:

1. **✓ Normal State** (Green Border)
   - Face detected and properly visible
   - Shows: "✓ Monitoring Active"
   - Displays face coverage percentage
   - Green box around your face

2. **⚠️ Warning States** (Red Overlay)
   - **No face detected** → "No face detected in frame"
   - **Face out of frame** → "Face moved out of frame"
   - **Partially hidden** → "Face partially hidden"
   - **Multiple people** → "Multiple people detected"

3. **Frame Saving**
   - Suspicious frames automatically saved to:
   - `face-detection-backend/suspicious_frames/STUDENT_001/`
   - Includes timestamp and reason in filename

### Visual Indicators:

**Header:**
- 🟢 "API Connected" (green) - Python backend is running
- 🔴 "API Offline" (red) - Python backend not available

**Footer:**
- Shows student ID
- Confirms frames are auto-saved

### Detection Settings:

- **Analysis Interval**: Every 1 second (adjustable in code)
- **Cooldown**: 5 seconds between same warnings
- **Face Visibility Threshold**: 70% (configured in Python API)
- **Face Confidence**: 50% (configured in Python API)

## 🔧 Troubleshooting

### "API Offline" showing:

**Check if Python API is running:**
```bash
# Should see: {"status":"ok","service":"Cheating Detection API"}
curl http://localhost:5000/health
```

**Start Python API:**
```bash
cd ..\face-detection-backend
python api.py
```

### Camera not working:
- Same as before - check Windows camera permissions
- Make sure no other app is using the camera

### Detection not working:
1. Check console for "Detection result:" logs
2. Verify API is connected (green indicator)
3. Check Python terminal for incoming requests

### Frames not being saved:
- Check `face-detection-backend/suspicious_frames/STUDENT_001/` folder
- Frames only saved when cheating is detected
- Check Python terminal for save confirmations

## 📊 Review Suspicious Activity

### Via API:
```bash
# Get list of all suspicious frames for a student
POST http://localhost:5000/check-student
{
  "student_id": "STUDENT_001"
}
```

### Via File System:
```
face-detection-backend/
└── suspicious_frames/
    └── STUDENT_001/
        ├── face_not_detected_20251116_143022_123456.jpg
        ├── multiple_faces_detected_20251116_143122_789012.jpg
        └── face_out_of_frame_20251116_143222_345678.jpg
```

## 🎨 Customization

### Change Detection Frequency:
In `camera-monitor.tsx` line 280:
```typescript
analysisIntervalRef.current = window.setInterval(analyzeFrame, 1000) // 1000ms = 1 second
```

### Change Student ID:
In `exam-interface.tsx` line 150:
```typescript
<CameraMonitor 
  onSuspiciousActivity={handleSuspiciousActivity} 
  studentId="YOUR_STUDENT_ID"  // <-- Change here
/>
```

### Adjust Face Detection Threshold:
In `face-detection-backend/api.py`:
```python
FACE_VISIBILITY_THRESHOLD = 0.7  # 70% visibility required
FACE_CONFIDENCE_THRESHOLD = 0.5  # 50% confidence required
```

## 📝 API Endpoints Used

- `GET /health` - Check if API is running
- `POST /analyze-frame` - Analyze single frame for cheating
- `POST /check-student` - Get all suspicious frames for student

See `API_DOCUMENTATION.md` for full API details.

## 🎯 Next Steps

1. Run `start-app.bat` to test everything
2. Check both windows (Python API + Desktop App)
3. Test by moving out of frame, covering face, etc.
4. Review saved frames in `suspicious_frames` folder
5. Check console logs for detection results

---

**The desktop app is now using professional computer vision instead of browser-based detection! 🎉**
