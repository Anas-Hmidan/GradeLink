# 🔧 Detection Tuning Guide

## Problem: False Positives (Normal Behavior Flagged as Suspicious)

If the system is flagging normal student behavior as suspicious (especially `face_partially_visible`), the detection thresholds are too strict.

## ✅ Fixed Settings (Applied)

### Before (Too Strict):
- `FACE_VISIBILITY_THRESHOLD = 0.7` (70% - way too high!)
- `MIN_SUSPICIOUS_DURATION = 2` seconds
- `EDGE_MARGIN_PIXELS = 10` pixels
- `SCALE_FACTOR = 1.15`
- `MIN_NEIGHBORS = 4`

### After (More Lenient):
- `FACE_VISIBILITY_THRESHOLD = 0.08` (8% - very lenient)
- `MIN_SUSPICIOUS_DURATION = 3` seconds (gives more time)
- `EDGE_MARGIN_PIXELS = 5` pixels (less strict on edges)
- `SCALE_FACTOR = 1.1` (more accurate detection)
- `MIN_NEIGHBORS = 3` (more lenient)

## 🎯 What Changed

### 1. Face Coverage Threshold (Most Important)
**Before:** Required 70% of frame to be face - impossible for normal use!  
**After:** Only requires 8% minimum, with smart logic:
- If face covers >5% of frame AND not at edge → ✅ OK
- This allows normal sitting positions at various distances

### 2. Edge Detection
**Before:** 10 pixels from edge = "out of frame"  
**After:** Only 5 pixels, more lenient

### 3. Persistence Duration
**Before:** Issue must persist 2 seconds  
**After:** Issue must persist 3 seconds (reduces false positives)

### 4. Detection Parameters
**Before:** High thresholds, might miss faces  
**After:** Lower thresholds, catches faces better

## 🧪 Testing Your Changes

### Test 1: Normal Behavior
Sit normally in front of camera for 30 seconds.

**Expected Result:**
- ✅ `cheating_detected: false`
- ✅ `reason: ok`
- ✅ NO screenshots saved
- ✅ Face coverage should be between 0.05-0.30 (5%-30%)

```bash
# Check no files created
dir suspicious_frames\STUDENT_001\
# Should be empty or not exist
```

### Test 2: Look Away
Turn your head completely away for 5+ seconds.

**Expected Result:**
- 🚨 `cheating_detected: true`
- 🚨 `reason: face_not_detected`
- 🚨 Screenshot saved (after 3 seconds)

### Test 3: Multiple People
Have someone else join you in frame.

**Expected Result:**
- 🚨 `cheating_detected: true`
- 🚨 `reason: multiple_faces_detected`
- 🚨 Screenshot saved immediately

## 🔧 Fine-Tuning (If Needed)

### Still Getting False Positives?

**Option 1: Make Even More Lenient**
Edit `config.py`:
```python
FACE_VISIBILITY_THRESHOLD = 0.03  # 3% - extremely lenient
MIN_SUSPICIOUS_DURATION = 5  # 5 seconds - very patient
EDGE_MARGIN_PIXELS = 3  # Almost at actual edge
```

**Option 2: Increase Persistence Time**
```python
MIN_SUSPICIOUS_DURATION = 5  # Wait 5 seconds before saving
```

**Option 3: Adjust Face Detection Sensitivity**
```python
MIN_NEIGHBORS = 2  # Even more lenient (may get false detections)
SCALE_FACTOR = 1.05  # More thorough search (slower but more accurate)
```

### Not Detecting Real Cheating?

**Option 1: Make More Strict**
```python
FACE_VISIBILITY_THRESHOLD = 0.10  # 10% minimum
MIN_SUSPICIOUS_DURATION = 2  # React faster
```

**Option 2: Increase Sensitivity**
```python
MIN_NEIGHBORS = 4  # Fewer false positives
SCALE_FACTOR = 1.2  # Faster but may miss some faces
```

## 📊 Understanding Face Coverage

Typical face coverage values:

| Scenario | Coverage | Should Trigger? |
|----------|----------|-----------------|
| Normal sitting (close) | 15-30% | ❌ No |
| Normal sitting (medium) | 8-15% | ❌ No |
| Sitting far away | 3-8% | ❌ No (borderline) |
| Very far / small face | 1-3% | ✅ Yes (too far) |
| Face at edge | 5-10% | ✅ Yes (if truly at edge) |
| No face visible | 0% | ✅ Yes |

## 🚀 Quick Test Command

Test your current configuration:

```bash
# Start API
python api.py

# In another terminal, run tests
python scripts\test_api.py
```

## 📝 Recommended Configuration

For **normal exam monitoring** (balanced):

```env
FACE_VISIBILITY_THRESHOLD=0.08
MIN_SUSPICIOUS_DURATION=3
FRAME_SAVE_COOLDOWN=5
EDGE_MARGIN_PIXELS=5
SCALE_FACTOR=1.1
MIN_NEIGHBORS=3
```

For **strict monitoring** (catches everything):

```env
FACE_VISIBILITY_THRESHOLD=0.12
MIN_SUSPICIOUS_DURATION=2
FRAME_SAVE_COOLDOWN=3
EDGE_MARGIN_PIXELS=10
SCALE_FACTOR=1.15
MIN_NEIGHBORS=4
```

For **lenient monitoring** (few false positives):

```env
FACE_VISIBILITY_THRESHOLD=0.05
MIN_SUSPICIOUS_DURATION=5
FRAME_SAVE_COOLDOWN=10
EDGE_MARGIN_PIXELS=3
SCALE_FACTOR=1.1
MIN_NEIGHBORS=2
```

## 🎯 Current Applied Configuration

The system is now configured with **lenient monitoring** settings to minimize false positives while still catching real cheating attempts.

**Key Logic:**
```python
# If face covers >5% of frame AND not at edge → OK
if face_coverage >= 0.05 and not is_at_edge:
    is_fully_visible = True  # ✅ Normal behavior
```

This means students can:
- ✅ Sit at various distances
- ✅ Move slightly without triggering alerts
- ✅ Have natural head movements
- ❌ Cannot leave the frame
- ❌ Cannot have others join them
- ❌ Cannot be absent for extended periods

## 🔍 Debugging Tips

### See Detailed Logs
```bash
type logs\api.log | findstr "SUSPICIOUS"
```

### Check Face Coverage Values
The API returns `face_coverage` in the response. Check what values you're getting:

```json
{
  "face_coverage": 0.15,  // 15% - this is normal!
  "cheating_detected": false,
  "reason": "ok"
}
```

If you're getting `face_coverage` between 0.05-0.30 and it's flagging as suspicious, the threshold is too high.

## ✅ Summary

**The fix:** Changed from requiring 70% face coverage (unrealistic) to 8% minimum with smart logic that accepts any face >5% that's not at the edge.

**Result:** Normal student behavior should now be correctly recognized as OK, while still catching:
- Students leaving the frame
- Multiple people
- Looking away for extended periods
- Being too far from camera

**Test it:** Run the API and verify you don't get false `face_partially_visible` warnings during normal use!
