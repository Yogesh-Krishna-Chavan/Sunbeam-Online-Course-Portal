from __future__ import annotations

import mysql.connector
from flask import Blueprint, request

from backend.db import Database, execute_single
from backend.utils.jwt_helper import create_access_token
from backend.utils.password import hash_password, verify_password
from backend.utils.validators import require_fields


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}

    ok, missing = require_fields(payload, ["name", "email", "password"])
    if not ok:
        return {"message": "Missing required fields", "fields": missing}, 400

    name = payload["name"]
    email = (payload.get("email") or "").strip().lower()
    password = payload["password"]
    mobile_no = payload.get("mobile_no")
    course_id = payload.get("course_id")
    role = payload.get("role", "student")

    existing_user = execute_single("SELECT email FROM users WHERE email = %s", (email,))
    if existing_user:
        return {"message": "User already exists."}, 409

    hashed_password = hash_password(password)

    connection = Database.get_connection()
    try:
        connection.start_transaction()
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
                (email, hashed_password, role),
            )
            if course_id is not None:
                cursor.execute(
                    """
                    INSERT INTO students (name, email, course_id, mobile_no)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (name, email, course_id, mobile_no),
                )
        connection.commit()
    except mysql.connector.Error as exc:
        connection.rollback()
        return {"message": "Registration failed", "detail": str(exc)}, 400
    finally:
        connection.close()

    access_token = create_access_token(email, {"role": role})
    return {"message": "Registration successful", "token": access_token}, 201


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}

    ok, missing = require_fields(payload, ["email", "password"])
    if not ok:
        return {"message": "Missing required fields", "fields": missing}, 400

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")

    user = execute_single("SELECT email, password, role FROM users WHERE email = %s", (email,))
    if not user or not verify_password(password, user["password"]):
        return {"message": "Invalid credentials."}, 401

    access_token = create_access_token(email, {"role": user.get("role")})
    return {"token": access_token, "email": email, "role": user.get("role")}, 200

