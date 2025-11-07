# Sunbeam API

## Setup

1. Create venv and activate (CMD):
```
py -3 -m venv .venv
.venv\Scripts\activate.bat
```

2. Install deps:
```
pip install -r backend\requirements.txt
```

3. Load schema (MySQL):
```
mysql -u root -proot < database\schema.sql
```

4. Optional: create `backend/.env` (defaults already set for root/root):
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=institute_management_db
SECRET_KEY=change-me
```

5. Run:
```
py -m backend.app
```

Health: GET http://127.0.0.1:5000/health

Auth:
- POST /api/auth/register
- POST /api/auth/login

