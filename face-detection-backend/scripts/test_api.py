"""
Comprehensive Test Suite for Cheating Detection API
Tests the critical requirement: Screenshots ONLY saved when suspicious activity detected
"""
import requests
import cv2
import numpy as np
import base64
import os
import time
import shutil
from datetime import datetime

API_URL = "http://localhost:5000"
TEST_STUDENT_ID = "TEST_STUDENT_001"
SUSPICIOUS_FRAMES_DIR = "suspicious_frames"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(message):
    print(f"{Colors.BLUE}🧪 TEST: {message}{Colors.RESET}")

def print_success(message):
    print(f"{Colors.GREEN}✅ PASS: {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}❌ FAIL: {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  WARNING: {message}{Colors.RESET}")

def print_section(title):
    print(f"\n{'='*60}")
    print(f"{Colors.BLUE}{title}{Colors.RESET}")
    print(f"{'='*60}\n")

def cleanup_test_data():
    """Remove test student data before tests"""
    test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, TEST_STUDENT_ID)
    if os.path.exists(test_folder):
        shutil.rmtree(test_folder)
        print(f"🗑️  Cleaned up test data: {test_folder}")

def create_test_frame_with_face(width=640, height=480):
    """Create a synthetic frame with a visible face (simulated)"""
    # Create blank frame
    frame = np.ones((height, width, 3), dtype=np.uint8) * 128
    
    # Draw a large rectangle to simulate a face in center
    face_w, face_h = 200, 250
    x = (width - face_w) // 2
    y = (height - face_h) // 2
    cv2.rectangle(frame, (x, y), (x + face_w, y + face_h), (180, 160, 140), -1)
    
    # Add eyes
    cv2.circle(frame, (x + 60, y + 80), 15, (50, 50, 50), -1)
    cv2.circle(frame, (x + 140, y + 80), 15, (50, 50, 50), -1)
    
    # Add mouth
    cv2.ellipse(frame, (x + 100, y + 180), (40, 20), 0, 0, 180, (50, 50, 50), 2)
    
    return frame

def create_test_frame_no_face():
    """Create a frame with no face visible"""
    frame = np.ones((480, 640, 3), dtype=np.uint8) * 100
    # Add some noise
    cv2.putText(frame, "NO FACE", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 2, (200, 200, 200), 3)
    return frame

def encode_frame(frame):
    """Encode frame to base64"""
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

def test_health_check():
    """Test 1: Health check endpoint"""
    print_test("Health Check")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'ok':
                print_success(f"API is healthy - Version: {data.get('version', 'unknown')}")
                print(f"   Configuration: {data.get('configuration', {})}")
                return True
            else:
                print_error("API returned non-ok status")
                return False
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to API. Is it running on http://localhost:5000?")
        return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_normal_monitoring_no_screenshot():
    """Test 2: CRITICAL - Normal monitoring should NOT save screenshots"""
    print_test("Normal Monitoring - NO Screenshot Should Be Saved")
    
    cleanup_test_data()
    
    # Create frame with visible face
    frame = create_test_frame_with_face()
    frame_b64 = encode_frame(frame)
    
    # Send frame for analysis
    response = requests.post(
        f"{API_URL}/analyze-frame",
        json={
            'frame': frame_b64,
            'student_id': TEST_STUDENT_ID
        },
        timeout=10
    )
    
    if response.status_code != 200:
        print_error(f"API returned status {response.status_code}")
        return False
    
    result = response.json()
    
    # Check that cheating is NOT detected
    if result.get('cheating_detected'):
        print_error("Cheating detected for normal frame (unexpected)")
        print(f"   Reason: {result.get('reason')}")
        return False
    
    # CHECK: Frame should NOT be saved
    if result.get('frame_saved'):
        print_error("🚨 CRITICAL BUG: Frame was saved during normal monitoring!")
        return False
    
    # Verify no files created
    test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, TEST_STUDENT_ID)
    if os.path.exists(test_folder) and os.listdir(test_folder):
        print_error(f"🚨 Files found in {test_folder} when there should be none!")
        print(f"   Files: {os.listdir(test_folder)}")
        return False
    
    print_success("No screenshot saved during normal monitoring ✓")
    print(f"   face_detected: {result.get('face_detected')}")
    print(f"   frame_saved: {result.get('frame_saved')}")
    return True

def test_suspicious_activity_saves_screenshot():
    """Test 3: CRITICAL - Suspicious activity SHOULD save screenshot"""
    print_test("Suspicious Activity - Screenshot SHOULD Be Saved")
    
    cleanup_test_data()
    
    # Create frame with no face
    frame = create_test_frame_no_face()
    frame_b64 = encode_frame(frame)
    
    # Send frame multiple times to trigger persistence check
    print("   Sending suspicious frames to trigger persistence...")
    for i in range(4):  # Send 4 times over 3+ seconds
        response = requests.post(
            f"{API_URL}/analyze-frame",
            json={
                'frame': frame_b64,
                'student_id': TEST_STUDENT_ID
            },
            timeout=10
        )
        
        if i < 3:
            time.sleep(1)  # Wait 1 second between frames
    
    if response.status_code != 200:
        print_error(f"API returned status {response.status_code}")
        return False
    
    result = response.json()
    
    # Check that cheating IS detected
    if not result.get('cheating_detected'):
        print_error("Cheating NOT detected for suspicious frame (unexpected)")
        return False
    
    # CHECK: Frame SHOULD be saved (after persistence check)
    if not result.get('frame_saved'):
        print_warning("Frame not saved yet (might be waiting for persistence)")
        # Check if file exists anyway
        test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, TEST_STUDENT_ID)
        if not os.path.exists(test_folder) or not os.listdir(test_folder):
            print_error("🚨 No screenshot saved for suspicious activity!")
            return False
    
    # Verify files were created
    test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, TEST_STUDENT_ID)
    if not os.path.exists(test_folder):
        print_error(f"Test folder not created: {test_folder}")
        return False
    
    files = os.listdir(test_folder)
    if len(files) == 0:
        print_error("No files saved in suspicious frames folder")
        return False
    
    print_success(f"Screenshot saved correctly for suspicious activity ✓")
    print(f"   cheating_detected: {result.get('cheating_detected')}")
    print(f"   reason: {result.get('reason')}")
    print(f"   frame_saved: {result.get('frame_saved')}")
    print(f"   files_created: {len(files)}")
    print(f"   files: {files}")
    return True

def test_multiple_normal_frames_no_spam():
    """Test 4: Multiple normal frames should NOT create any files"""
    print_test("Multiple Normal Frames - No Files Should Be Created")
    
    cleanup_test_data()
    
    # Send 10 normal frames
    frame = create_test_frame_with_face()
    frame_b64 = encode_frame(frame)
    
    saved_count = 0
    for i in range(10):
        response = requests.post(
            f"{API_URL}/analyze-frame",
            json={
                'frame': frame_b64,
                'student_id': TEST_STUDENT_ID
            },
            timeout=10
        )
        
        result = response.json()
        if result.get('frame_saved'):
            saved_count += 1
        
        time.sleep(0.1)  # Small delay
    
    # Verify no files created
    test_folder = os.path.join(SUSPICIOUS_FRAMES_DIR, TEST_STUDENT_ID)
    if os.path.exists(test_folder) and os.listdir(test_folder):
        print_error(f"🚨 Files created during normal monitoring: {os.listdir(test_folder)}")
        return False
    
    if saved_count > 0:
        print_error(f"🚨 Frames marked as saved: {saved_count}/10")
        return False
    
    print_success("No files created for 10 normal frames ✓")
    return True

def test_check_student_endpoint():
    """Test 5: Check student endpoint"""
    print_test("Check Student Endpoint")
    
    response = requests.post(
        f"{API_URL}/check-student",
        json={'student_id': TEST_STUDENT_ID},
        timeout=10
    )
    
    if response.status_code != 200:
        print_error(f"API returned status {response.status_code}")
        return False
    
    result = response.json()
    count = result.get('suspicious_activity_count', 0)
    
    print_success(f"Student check successful")
    print(f"   Suspicious activities: {count}")
    print(f"   Frames: {len(result.get('frames', []))}")
    return True

def run_all_tests():
    """Run complete test suite"""
    print_section("🚀 CHEATING DETECTION API TEST SUITE")
    print(f"Testing API at: {API_URL}")
    print(f"Test Student ID: {TEST_STUDENT_ID}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Health Check", test_health_check),
        ("Normal Monitoring (No Screenshot)", test_normal_monitoring_no_screenshot),
        ("Suspicious Activity (Screenshot)", test_suspicious_activity_saves_screenshot),
        ("Multiple Normal Frames (No Spam)", test_multiple_normal_frames_no_spam),
        ("Check Student Endpoint", test_check_student_endpoint),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'-'*60}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"Test crashed: {e}")
            results.append((test_name, False))
        time.sleep(0.5)
    
    # Summary
    print_section("📊 TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    if passed == total:
        print(f"{Colors.GREEN}✅ ALL TESTS PASSED ({passed}/{total}){Colors.RESET}")
        print(f"{Colors.GREEN}🔒 API correctly saves screenshots ONLY when suspicious activity detected{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ SOME TESTS FAILED ({passed}/{total}){Colors.RESET}")
    print(f"{'='*60}\n")
    
    # Cleanup
    cleanup_test_data()
    
    return passed == total

if __name__ == "__main__":
    print("\n" + "="*60)
    print("CRITICAL REQUIREMENT TEST:")
    print("Screenshots should ONLY be saved when cheating detected")
    print("="*60 + "\n")
    
    success = run_all_tests()
    exit(0 if success else 1)

def test_check_student(student_id="STU001"):
    """Test checking student suspicious activity"""
    print(f"\n[TEST] Checking student: {student_id}")
    
    response = requests.post(
        f"{API_BASE_URL}/check-student",
        json={'student_id': student_id}
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Suspicious Activities: {result.get('suspicious_activity_count')}")
    print(f"Frames: {result.get('frames')}")

if __name__ == "__main__":
    print("=" * 60)
    print("CHEATING DETECTION API - TEST SUITE")
    print("=" * 60)
    
    # Test 1: Health check
    test_health()
    
    # Test 2: You'll need to provide an actual image path
    # test_analyze_frame("path/to/test_image.jpg")
    
    # Test 3: Check student records
    # test_check_student("STU001")
    
    print("\n" + "=" * 60)
    print("Note: Update test_analyze_frame() with actual image paths")
    print("=" * 60)
