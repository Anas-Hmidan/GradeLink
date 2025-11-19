"""
Debug script to test screenshot saving
Sends multiple suspicious frames to trigger persistence
"""
import requests
import cv2
import numpy as np
import base64
import time
import os

API_URL = "http://localhost:5000"
STUDENT_ID = "DEBUG_TEST_001"
SUSPICIOUS_FRAMES_DIR = "suspicious_frames"

def create_no_face_frame():
    """Create a frame with no face (suspicious)"""
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(frame, "NO FACE HERE", (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
    return frame

def encode_frame(frame):
    """Encode frame to base64"""
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

def test_screenshot_saving():
    print("="*60)
    print("🧪 DEBUG: Testing Screenshot Saving")
    print("="*60)
    print(f"API: {API_URL}")
    print(f"Student ID: {STUDENT_ID}")
    print()
    
    # Clean up previous test
    test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, STUDENT_ID)
    if os.path.exists(test_folder):
        import shutil
        shutil.rmtree(test_folder)
        print(f"🗑️  Cleaned up previous test folder")
    
    # Create suspicious frame
    frame = create_no_face_frame()
    frame_b64 = encode_frame(frame)
    
    print(f"\n📤 Sending suspicious frames (no face detected)...")
    print(f"Need to persist for 1+ seconds before saving\n")
    
    # Send frame multiple times to trigger persistence
    for i in range(5):
        print(f"📸 Attempt {i+1}/5...")
        
        response = requests.post(
            f"{API_URL}/analyze-frame",
            json={
                'frame': frame_b64,
                'student_id': STUDENT_ID
            },
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Error: API returned status {response.status_code}")
            print(f"Response: {response.text}")
            continue
        
        result = response.json()
        
        print(f"   cheating_detected: {result.get('cheating_detected')}")
        print(f"   reason: {result.get('reason')}")
        print(f"   frame_saved: {result.get('frame_saved')}")
        
        if result.get('frame_saved'):
            print(f"   ✅ SAVED: {result.get('frame_path')}")
            break
        else:
            print(f"   ⏳ Not saved yet (waiting for persistence)")
        
        # Wait before next attempt
        if i < 4:
            time.sleep(0.5)  # Wait 0.5 seconds
        print()
    
    # Check if files were created
    print("\n" + "="*60)
    print("📁 Checking filesystem...")
    print("="*60)
    
    if os.path.exists(test_folder):
        files = os.listdir(test_folder)
        if files:
            print(f"✅ SUCCESS! Found {len(files)} file(s):")
            for f in files:
                filepath = os.path.join(test_folder, f)
                size = os.path.getsize(filepath)
                print(f"   📄 {f} ({size:,} bytes)")
        else:
            print(f"❌ FAILURE: Folder exists but no files inside")
            print(f"   Path: {os.path.abspath(test_folder)}")
    else:
        print(f"❌ FAILURE: Folder not created")
        print(f"   Expected: {os.path.abspath(test_folder)}")
    
    print("\n" + "="*60)
    print("💡 Check API logs for more details:")
    print("   type logs\\api.log")
    print("="*60)

if __name__ == "__main__":
    try:
        test_screenshot_saving()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API")
        print("Please ensure the API is running:")
        print("   python api.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
