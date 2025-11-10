"""Test script for all API endpoints"""
import json
import time
import urllib.request
import urllib.parse
import urllib.error

BASE_URL = "http://127.0.0.1:5000"

def make_request(method, url, headers=None, data=None, params=None):
    """Make HTTP request"""
    if params:
        url += "?" + urllib.parse.urlencode(params)
    
    req = urllib.request.Request(url, headers=headers or {})
    req.get_method = lambda: method
    
    if data:
        data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Content-Length', str(len(data)))
    
    try:
        with urllib.request.urlopen(req, data=data) as response:
            status_code = response.getcode()
            response_data = response.read().decode('utf-8')
            try:
                return status_code, json.loads(response_data)
            except:
                return status_code, response_data
    except urllib.error.HTTPError as e:
        response_data = e.read().decode('utf-8')
        try:
            return e.code, json.loads(response_data)
        except:
            return e.code, response_data
    except Exception as e:
        return None, str(e)

def print_response(title, status_code, response_data):
    """Print formatted response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    if status_code:
        print(f"Status Code: {status_code}")
    else:
        print(f"Error: {response_data}")
        return
    if isinstance(response_data, dict):
        print(f"Response: {json.dumps(response_data, indent=2)}")
    else:
        print(f"Response: {response_data}")

# ---------------------- AUTH ----------------------

def test_health_check():
    """Test health check endpoint"""
    print("\n[1] Testing Health Check...")
    status_code, response_data = make_request("GET", f"{BASE_URL}/health")
    print_response("Health Check", status_code, response_data)
    return status_code == 200

def test_login():
    """Test login to get admin token"""
    print("\n[2] Testing Login (Admin)...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    status_code, response_data = make_request("POST", f"{BASE_URL}/api/auth/login", data=login_data)
    print_response("Login", status_code, response_data)
    
    if status_code == 200 and isinstance(response_data, dict):
        if response_data.get("success") and "data" in response_data and "token" in response_data["data"]:
            return response_data["data"]["token"]
    
    print("\n⚠️  Login failed. Ensure admin user exists.")
    return None

# ---------------------- COURSES ----------------------

def test_get_all_active_courses():
    """Test get all active courses (public)"""
    print("\n[3] Testing Get All Active Courses (Public)...")
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/courses/all-active-courses")
    print_response("Get All Active Courses", status_code, response_data)
    return status_code == 200

def test_get_all_courses_without_token():
    """Test get all courses without token (should fail)"""
    print("\n[4] Testing Get All Courses (Without Token - Should Fail)...")
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/courses/all-courses")
    print_response("Get All Courses (No Token)", status_code, response_data)
    return status_code == 401

def test_get_all_courses_with_token(token):
    """Test get all courses with admin token"""
    print("\n[5] Testing Get All Courses (With Admin Token)...")
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/courses/all-courses", headers=headers)
    print_response("Get All Courses (With Token)", status_code, response_data)
    return status_code == 200

def test_add_course_without_token():
    """Test add course without token (should fail)"""
    print("\n[6] Testing Add Course (Without Token - Should Fail)...")
    course_data = {
        "courseName": "Test Course",
        "description": "Test Description",
        "fees": 1000,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "videoExpireDays": 365
    }
    status_code, response_data = make_request("POST", f"{BASE_URL}/api/courses/add", data=course_data)
    print_response("Add Course (No Token)", status_code, response_data)
    return status_code == 401

def test_add_course_with_token(token):
    """Test add course with admin token; returns created course_id (best-effort)."""
    print("\n[7] Testing Add Course (With Admin Token)...")
    unique_suffix = str(int(time.time()))
    course_name = f"Python Programming {unique_suffix}"
    course_data = {
        "courseName": course_name,
        "description": "Learn Python from scratch",
        "fees": 5000,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "videoExpireDays": 365
    }
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("POST", f"{BASE_URL}/api/courses/add", headers=headers, data=course_data)
    print_response("Add Course (With Token)", status_code, response_data)
    
    if status_code != 200:
        return None

    # Try to get the latest course_id
    status_code2, response_data2 = make_request("GET", f"{BASE_URL}/api/courses/all-courses", headers=headers)
    if status_code2 == 200 and isinstance(response_data2, dict) and response_data2.get("success"):
        data = response_data2.get("data") or []
        if isinstance(data, list) and len(data) > 0:
            # pick the course with max course_id
            try:
                latest = max(data, key=lambda x: x.get("course_id", 0))
                return latest.get("course_id")
            except Exception:
                return None
    return None

def test_update_course_with_token(token, course_id):
    """Test update course with admin token"""
    print(f"\n[8] Testing Update Course (Course ID: {course_id})...")
    course_data = {
        "courseName": "Advanced Python Programming",
        "description": "Advanced Python concepts and frameworks",
        "fees": 6000,
        "startDate": "2024-02-01",
        "endDate": "2024-12-31",
        "videoExpireDays": 365
    }
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("PUT", f"{BASE_URL}/api/courses/update/{course_id}", headers=headers, data=course_data)
    print_response(f"Update Course (ID: {course_id})", status_code, response_data)
    return status_code == 200

def test_delete_course_with_token(token, course_id):
    """Test delete course with admin token"""
    print(f"\n[9] Testing Delete Course (Course ID: {course_id})...")
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("DELETE", f"{BASE_URL}/api/courses/delete/{course_id}", headers=headers)
    print_response(f"Delete Course (ID: {course_id})", status_code, response_data)
    return status_code == 200

def test_get_all_courses_with_filters(token):
    """Test get all courses with date filters"""
    print("\n[10] Testing Get All Courses (With Date Filters)...")
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
    }
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/courses/all-courses", headers=headers, params=params)
    print_response("Get All Courses (With Filters)", status_code, response_data)
    return status_code == 200

# ---------------------- STUDENTS ----------------------

def test_register_student_to_course(course_id):
    """Registers a unique student to a course"""
    print("\n[11] Testing Register Student to Course...")
    unique_suffix = str(int(time.time()))
    email = f"student{unique_suffix}@example.com"
    payload = {
        "name": "Test Student",
        "email": email,
        "courseId": course_id,
        "mobileNo": "9876543210"
    }
    status_code, response_data = make_request("POST", f"{BASE_URL}/api/students/register-to-course", data=payload)
    print_response("Register Student to Course", status_code, response_data)
    # Treat 200 as pass; if already enrolled (shouldn't happen), 400
    return (status_code == 200), email

def test_change_password(email):
    """Changes password for given email"""
    print("\n[12] Testing Change Password...")
    payload = {"newPassword": "newpass123", "confirmPassword": "newpass123"}
    status_code, response_data = make_request("PUT", f"{BASE_URL}/api/students/change-password/{email}", data=payload)
    print_response("Change Password", status_code, response_data)
    return status_code == 200

# ---------------------- VIDEOS ----------------------

def test_get_videos_for_student(email, course_id):
    """Public: list videos for student+course (may be empty)"""
    print("\n[13] Testing Get Videos for Student (Public)...")
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/videos/all/{email}/{course_id}")
    print_response("Get Videos for Student", status_code, response_data)
    return status_code == 200

def test_get_all_videos_without_token():
    """Admin videos without token should fail"""
    print("\n[14] Testing Get All Videos (Without Token - Should Fail)...")
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/videos/all-videos")
    print_response("Get All Videos (No Token)", status_code, response_data)
    return status_code == 401

def test_add_video(token, course_id):
    """Admin: add a video to a course"""
    print("\n[15] Testing Add Video (Admin)...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "courseId": course_id,
        "title": "Introduction",
        "description": "Overview video",
        "youtubeURL": "https://youtu.be/dQw4w9WgXcQ"
    }
    status_code, response_data = make_request("POST", f"{BASE_URL}/api/videos/add", headers=headers, data=payload)
    print_response("Add Video (Admin)", status_code, response_data)
    return status_code == 200

def get_latest_video_id(token, course_id):
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/videos/all-videos", headers=headers, params={"courseId": course_id})
    if status_code == 200 and isinstance(response_data, dict) and response_data.get("success"):
        data = response_data.get("data") or []
        if isinstance(data, list) and len(data) > 0:
            try:
                return max(data, key=lambda x: x.get("video_id", 0)).get("video_id")
            except Exception:
                return None
    return None

def test_get_all_videos_with_token(token, course_id):
    print("\n[16] Testing Get All Videos (Admin, With Token)...")
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("GET", f"{BASE_URL}/api/videos/all-videos", headers=headers, params={"courseId": course_id})
    print_response("Get All Videos (With Token)", status_code, response_data)
    return status_code == 200

def test_update_video(token, video_id, course_id):
    print(f"\n[17] Testing Update Video (ID: {video_id})...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "courseId": course_id,
        "title": "Updated Title",
        "description": "Updated description",
        "youtubeURL": "https://youtu.be/dQw4w9WgXcQ"
    }
    status_code, response_data = make_request("PUT", f"{BASE_URL}/api/videos/update/{video_id}", headers=headers, data=payload)
    print_response("Update Video (Admin)", status_code, response_data)
    return status_code == 200

def test_delete_video(token, video_id):
    print(f"\n[18] Testing Delete Video (ID: {video_id})...")
    headers = {"Authorization": f"Bearer {token}"}
    status_code, response_data = make_request("DELETE", f"{BASE_URL}/api/videos/delete/{video_id}", headers=headers)
    print_response("Delete Video (Admin)", status_code, response_data)
    return status_code == 200

# ---------------------- MAIN ----------------------

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("API TESTING SUITE - Sunbeam Online Course Portal")
    print("="*60)
    
    # Wait for server to be ready
    print("\nWaiting for server to be ready...")
    time.sleep(2)
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_health_check()))
    
    # Test 2: Login
    token = test_login()
    if not token:
        print("\n❌ Cannot proceed with admin tests without valid token.")
        print("Please ensure you have an admin user in the database.")
        print("You can create one by inserting into users table with role='admin'")
        return
    
    results.append(("Login", True))
    
    # Test 3: Get All Active Courses (Public)
    results.append(("Get All Active Courses (Public)", test_get_all_active_courses()))
    
    # Test 4: Get All Courses without token (should fail)
    results.append(("Get All Courses (No Token - Should Fail)", test_get_all_courses_without_token()))
    
    # Test 5: Get All Courses with token
    results.append(("Get All Courses (With Token)", test_get_all_courses_with_token(token)))
    
    # Test 6: Add Course without token (should fail)
    results.append(("Add Course (No Token - Should Fail)", test_add_course_without_token()))
    
    # Test 7: Add Course with token
    course_id = test_add_course_with_token(token)
    if course_id:
        results.append(("Add Course (With Token)", True))
        
        # Test 8: Update Course
        results.append(("Update Course", test_update_course_with_token(token, course_id)))
        
        # Test 9: Delete Course
        results.append(("Delete Course", test_delete_course_with_token(token, course_id)))
    else:
        results.append(("Add Course (With Token)", False))
    
    # Test 10: Get All Courses with filters
    results.append(("Get All Courses (With Filters)", test_get_all_courses_with_filters(token)))

    # Students: register and change password (requires a course). Ensure a course exists: add another one to register to
    course_id_for_student = test_add_course_with_token(token)
    if course_id_for_student:
        ok_reg, student_email = test_register_student_to_course(course_id_for_student)
        results.append(("Register Student to Course", ok_reg))
        results.append(("Change Password", test_change_password(student_email)))

        # Videos: public list (likely empty initially)
        results.append(("Get Videos for Student (Public)", test_get_videos_for_student(student_email, course_id_for_student)))

        # Videos admin negative
        results.append(("Get All Videos (No Token - Should Fail)", test_get_all_videos_without_token()))

        # Add video, list, update, delete
        results.append(("Add Video (Admin)", test_add_video(token, course_id_for_student)))
        results.append(("Get All Videos (With Token)", test_get_all_videos_with_token(token, course_id_for_student)))
        latest_video_id = get_latest_video_id(token, course_id_for_student)
        if latest_video_id:
            results.append(("Update Video (Admin)", test_update_video(token, latest_video_id, course_id_for_student)))
            results.append(("Delete Video (Admin)", test_delete_video(token, latest_video_id)))
        else:
            results.append(("Update Video (Admin)", False))
            results.append(("Delete Video (Admin)", False))
    else:
        results.append(("Register Student to Course", False))
        results.append(("Change Password", False))
        results.append(("Get Videos for Student (Public)", False))
        results.append(("Get All Videos (No Token - Should Fail)", False))
        results.append(("Add Video (Admin)", False))
        results.append(("Get All Videos (With Token)", False))
        results.append(("Update Video (Admin)", False))
        results.append(("Delete Video (Admin)", False))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = 0
    failed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)} | Passed: {passed} | Failed: {failed}")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except urllib.error.URLError as e:
        print(f"\n❌ ERROR: Cannot connect to server. Make sure the Flask server is running on http://127.0.0.1:5000")
        print(f"Details: {str(e)}")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

