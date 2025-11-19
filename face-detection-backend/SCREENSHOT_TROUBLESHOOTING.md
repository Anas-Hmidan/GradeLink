# 🔧 Screenshot Troubleshooting Guide

## Problem: Screenshots Not Saving

If the API detects suspicious activity (`cheating_detected: true`) but no screenshots are being saved, follow these steps:

## ✅ Quick Fix Applied

I've made the following changes to help screenshots save more reliably:

1. **Reduced persistence time**: 3s → **1s** (faster response)
2. **Added detailed logging**: See exactly what's happening
3. **Created debug script**: Easy testing

## 🧪 Step 1: Run Debug Script

```bash
python scripts\debug_screenshot.py
```

This will:
- Send 5 suspicious frames over 2.5 seconds
- Show you exactly what's happening
- Tell you if screenshots were saved

**Expected Output:**
```
📸 Attempt 1/5...
   cheating_detected: True
   reason: face_not_detected
   frame_saved: False
   ⏳ Not saved yet (waiting for persistence)

📸 Attempt 2/5...
   cheating_detected: True
   reason: face_not_detected
   frame_saved: False
   ⏳ Not saved yet (waiting for persistence)

📸 Attempt 3/5...
   cheating_detected: True
   reason: face_not_detected
   frame_saved: True
   ✅ SAVED: suspicious_frames/DEBUG_TEST_001/face_not_detected_20251119_103045.jpg

✅ SUCCESS! Found 1 file(s)
```

## 🔍 Step 2: Check API Logs

Look at the detailed logs:

```bash
type logs\api.log | findstr /C:"📸" /C:"🚨" /C:"⏱️"
```

**What to look for:**

### ✅ Good (Working):
```
📸 Attempting to save frame for STUDENT_001 - Reason: face_not_detected
⏱️  First occurrence of 'face_not_detected' for STUDENT_001, tracking persistence (need 1s)
⏱️  Issue 'face_not_detected' for STUDENT_001: 0.5s / 1s (not persistent yet)
⏱️  Issue 'face_not_detected' for STUDENT_001: 1.2s / 1s (not persistent yet)
💾 Writing frame to: suspicious_frames/STUDENT_001/face_not_detected_20251119.jpg
🚨 SUSPICIOUS ACTIVITY SAVED: STUDENT_001 - face_not_detected - Persisted for 1.2s
```

### ❌ Bad (Not Working):
```
📸 Attempting to save frame for STUDENT_001 - Reason: face_not_detected
⏱️  First occurrence of 'face_not_detected' for STUDENT_001, tracking persistence (need 1s)
⏱️  First occurrence of 'face_not_detected' for STUDENT_001, tracking persistence (need 1s)
⏱️  First occurrence of 'face_not_detected' for STUDENT_001, tracking persistence (need 1s)
```

**Problem:** Each frame resets the timer - frames aren't coming fast enough!

## 🛠️ Solutions

### Solution 1: Disable Persistence Check (Testing Only)

Edit `config.py`:
```python
MIN_SUSPICIOUS_DURATION = 0  # Save immediately, no persistence check
```

Restart API and test again. If this works, the issue is persistence timing.

### Solution 2: Check Frame Rate

The issue must persist across multiple frames. If your app only sends 1 frame per 2 seconds, it will never persist for 1 second.

**Fix in your frontend:** Send frames more frequently:
```javascript
// Before: Every 2 seconds
setInterval(analyzeFrame, 2000)

// After: Every 500ms (0.5 seconds)
setInterval(analyzeFrame, 500)
```

### Solution 3: Increase Cooldown Window

Edit `config.py`:
```python
FRAME_SAVE_COOLDOWN = 10  # 10 seconds instead of 5
```

This gives more time for persistence to work.

### Solution 4: Check File Permissions

Ensure the API can write files:

```bash
# Check if folder exists and is writable
mkdir suspicious_frames
dir suspicious_frames
```

If you get permission errors in logs, run as administrator or change folder location.

### Solution 5: Verify Frame Data

Check if 'frame' key exists in result:

Look for this in logs:
```
🔍 Cheating detected for STUDENT_001, attempting to save frame...
```

If you see this but NO follow-up messages, the frame data might be missing.

## 🎯 Current Configuration

| Setting | Value | What It Means |
|---------|-------|---------------|
| `MIN_SUSPICIOUS_DURATION` | 1s | Issue must persist 1 second |
| `FRAME_SAVE_COOLDOWN` | 5s | Wait 5s between saves |
| Frame send rate | ? | How often your app sends frames |

**For screenshots to save:**
- Your app must send ≥2 frames within 1 second showing the same issue
- Example: Send frame every 0.5s → 2 frames in 1s → ✅ Will save

## 📊 Debugging Checklist

- [ ] API is running (`python api.py`)
- [ ] Logs directory exists (`logs/`)
- [ ] Suspicious frames directory exists (`suspicious_frames/`)
- [ ] Debug script runs successfully
- [ ] API logs show persistence tracking
- [ ] Frames are sent frequently enough (< 1 second apart)
- [ ] No permission errors in logs
- [ ] Frame data is included in API requests

## 🚀 Quick Tests

### Test 1: Manual Frame Save
```bash
python scripts\debug_screenshot.py
```

### Test 2: Check Logs
```bash
type logs\api.log
```

### Test 3: Disable Persistence (Temporary)
Edit `config.py`:
```python
MIN_SUSPICIOUS_DURATION = 0
```
Restart API, test again.

### Test 4: Check Directory
```bash
dir suspicious_frames\STUDENT_001\
```

## 💡 Most Common Issue

**Problem:** Frames aren't being sent frequently enough.

**Symptom:** Logs show "First occurrence" every time, never "not persistent yet"

**Fix:** In your frontend/client, reduce the interval between frame captures:

```javascript
// React/JavaScript
useEffect(() => {
  const interval = setInterval(captureAndAnalyze, 500); // 500ms = 2 frames per second
  return () => clearInterval(interval);
}, []);
```

```python
# Python client
while True:
    frame = capture_frame()
    analyze_frame(frame)
    time.sleep(0.5)  # 500ms between frames
```

## 📞 Still Not Working?

Check these logs and report what you see:

1. **Last 20 lines of API log:**
   ```bash
   Get-Content logs\api.log -Tail 20
   ```

2. **Directory contents:**
   ```bash
   dir suspicious_frames\
   ```

3. **Debug script output:**
   ```bash
   python scripts\debug_screenshot.py
   ```

The logs will show exactly where the process is failing!
