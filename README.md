Sunbeam Online Course Portal

Overview

- This repository contains a Flask-based backend for the Sunbeam Online Course Portal.
- It provides authentication, student registration, course management, and video management APIs using MySQL.

Key Features

- Authentication with JWT (HS256)
- Student registration and password management
- Courses CRUD with date-based filtering and active courses
- Videos CRUD per course with per-video expiration logic
- Role-based access control (admin-protected endpoints)
- Postman collection included for easy testing
- End-to-end API test script

Tech Stack

- Python 3.11+
- Flask 3.x
- MySQL (mysql-connector-python)
- PyJWT
- python-dotenv

Architecture Overview

- Backend: Python (Flask)
  - REST APIs for auth, students, courses, videos
  - JWT authentication and admin role enforcement
  - MySQL connection pooling
- Database: MySQL
  - Tables: users, courses, students, videos
  - See database/schema.sql
- Frontend: ReactJS
  - Consumes the backend APIs
  - Uses Bootstrap for styling

Frontend (ReactJS)

- A ReactJS frontend can consume these APIs.
- Typical setup (if you add a React app under frontend/):
- cd frontend
- npm install
- npm start
- Configure the API base URL (examples):
- Vite: create frontend/.env with VITE_API_BASE=http://127.0.0.1:5000
- CRA: create frontend/.env with REACT_APP_API_BASE=http://127.0.0.1:5000
- Use this value for requests, e.g. fetch(`${API_BASE}/api/auth/login`).
- Authentication: store the JWT (from /api/auth/login) in memory or secure storage and send with Authorization: Bearer <token> for admin-only routes.
- CORS: if you run the React app on a different port (e.g., 5173/3000), configure your HTTP client to call the backend by absolute URL. If you add server-side CORS, use Flask-CORS.

Frontend Styling (Bootstrap)

- This project uses Bootstrap for UI styling in the React app.
- Install (npm):
- npm install bootstrap
- Import CSS in your React entry (e.g., src/main.jsx or src/index.tsx):
- import 'bootstrap/dist/css/bootstrap.min.css';
- Optional JS plugins (tooltips, modals, etc.):
- import 'bootstrap/dist/js/bootstrap.bundle.min.js';
- Or include via CDN in public/index.html:
- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
- <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

Project Structure

- backend/
  - app.py: Entrypoint to run the Flask app
  - **init**.py: App factory and health check
  - config/
    - settings.py: Environment-based settings (loaded from .env)
  - db/
    - pool.py: MySQL connection pool and helpers
  - middlewares/
    - auth_middleware.py: Admin role decorator
    - error_handlers.py: Common error handlers (optional)
  - routes/
    - authRoutes.py: Login
    - studentsRoutes.py: Student registration and password change
    - courseRoutes.py: Courses CRUD and filtering
    - videoRoutes.py: Videos CRUD and public student listing
  - utils/
    - jwt_helper.py, password.py, validators.py: Helpers
- database/
  - schema.sql: MySQL schema for users/courses/students/videos
- Sunbeam_Online_Course_Portal.postman_collection.json: Postman API collection
- test_apis.py: End-to-end API test suite (PowerShell-friendly)

Getting Started

1. Prerequisites

- Python 3.11 or higher (Windows: Python launcher available as py)
- MySQL server running locally (defaults: root/root)

2. Install Python dependencies

- Run in project root:
- pip install -r backend\requirements.txt

3. Create database schema

- Using MySQL CLI:
- mysql -u root -proot < database\schema.sql

4. Configure environment (optional)

- Create backend/.env to override defaults in backend/config/settings.py:
- MYSQL_HOST=localhost
- MYSQL_PORT=3306
- MYSQL_USER=root
- MYSQL_PASSWORD=root
- MYSQL_DATABASE=institute_management_db
- SECRET_KEY=change-me
- JWT_ALGORITHM=HS256
- JWT_EXPIRATION_MINUTES=60

Running the Server

- From project root:
- py -m backend.app
- Health check: http://127.0.0.1:5000/health

Authentication

- JWT access tokens are created on login and must be sent as:
- Authorization: Bearer <token>
- Token payload includes role, used by admin-protected endpoints.

Admin User

- Ensure an admin user exists in users table:
- email: admin@example.com
- password: SHA256("admin123")
- role: admin
- You can also use the included helper script (created earlier in development) or insert directly via SQL.

Database Schema (summary)

- users(email, password, role)
- courses(course_id, course_name, description, fees, start_date, end_date, video_expire_days)
- students(reg_no, name, email, course_id, mobile_no, profile_pic)
- videos(video_id, course_id, title, youtube_url, description, added_at)

Database (MySQL) Details

- Configuration via backend/config/settings.py or backend/.env
- Pooling handled in backend/db/pool.py (mysql-connector-python)
- Default connection: host=localhost, port=3306, user=root, password=root, database=institute_management_db
- Initialize schema: mysql -u root -proot < database\schema.sql

API Summary

- Health
  - GET /health
- Auth
  - POST /api/auth/login
- Students
  - POST /api/students/register-to-course
  - PUT /api/students/change-password/<email>
- Courses
  - GET /api/courses/all-active-courses (public)
  - GET /api/courses/all-courses (admin, optional startDate/endDate filters)
  - POST /api/courses/add (admin)
  - PUT /api/courses/update/<course_id> (admin)
  - DELETE /api/courses/delete/<course_id> (admin)
- Videos
  - GET /api/videos/all/<email>/<course_id> (public) — only non-expired videos
  - GET /api/videos/all-videos (admin, optional courseId filter)
  - POST /api/videos/add (admin)
  - PUT /api/videos/update/<video_id> (admin)
  - DELETE /api/videos/delete/<video_id> (admin)

Postman Collection

- Import Sunbeam_Online_Course_Portal.postman_collection.json into Postman.
- Variables:
  - base_url: http://127.0.0.1:5000
  - token: set automatically by the Login request test script.
- Run Login, then use admin-only routes with the saved token.

Testing (Manual)

1. Start the server

- py -m backend.app

2. Test with curl/Postman (examples)

- Login (admin):
- curl -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
- Public active courses:
- curl %BASE%/api/courses/all-active-courses

End-to-End Test Suite

- The script test_apis.py runs full coverage of the APIs (auth, student, courses, videos).
- In a second PowerShell window at project root:
- py test_apis.py
- What it does:
  - Health check
  - Login as admin
  - Courses: public/admin lists, add/update/delete, filters
  - Students: register-to-course, change-password
  - Videos: public listing for a student+course, admin list/add/update/delete
- It dynamically discovers created course_id/video_id by querying admin lists.

Common Issues & Troubleshooting

- Cannot connect to server
  - Ensure the server is running (py -m backend.app)
  - Verify health endpoint returns {"status":"ok"}
- Invalid email or password on login
  - Ensure the admin user exists with SHA256 hashed password and role='admin'
- 401/403 on admin endpoints
  - Ensure Authorization header uses a valid Bearer token from Login
- MySQL connection errors
  - Check backend/.env or defaults in backend/config/settings.py
  - Confirm DB is reachable and database exists

Conventions

- Date filters are YYYY-MM-DD strings
- All JSON request/response bodies use snake_case or camelCase per endpoint compatibility, with fallbacks handled in code
- Responses follow a standard shape:
- { \"success\": true|false, \"message\": string, \"data\": any? }

License

- For educational and internal use. Update with your preferred license if needed.

Maintainers

- Sunbeam Internship Team — contributions welcome via PR.
