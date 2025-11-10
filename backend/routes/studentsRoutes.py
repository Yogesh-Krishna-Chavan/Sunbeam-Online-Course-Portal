from __future__ import annotations

import mysql.connector
from flask import Blueprint, jsonify, request

from backend.db import Database
from backend.utils.password import hash_password_sha256


students_bp = Blueprint("students", __name__)


@students_bp.post("/register-to-course")
def register_to_course():
    """POST: registers a student into a course"""
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    email = (payload.get("email") or "").strip().lower()
    course_id = payload.get("courseId") or payload.get("course_id")
    mobile_no = payload.get("mobileNo") or payload.get("mobile_no")

    if not name or not email or not course_id:
        return jsonify({
            "success": False,
            "message": "Name, email, and courseId are required"
        }), 400

    connection = Database.get_connection()
    try:
        connection.start_transaction()
        cursor = connection.cursor(dictionary=True)

        # 1. Check if student exists
        check_email_sql = "SELECT * FROM users WHERE email = %s"
        cursor.execute(check_email_sql, (email,))
        check_email_result = cursor.fetchall()

        # 2. If student does not exist (then add it into users table)
        if not check_email_result or len(check_email_result) == 0:
            # New student data to be added into users table with default password
            default_password = "sunbeam"
            hash_password = hash_password_sha256(default_password)

            insert_sql = "INSERT INTO users (email, password) VALUES (%s, %s)"
            cursor.execute(insert_sql, (email, hash_password))
            if cursor.rowcount == 0:
                connection.rollback()
                cursor.close()
                return jsonify({
                    "success": False,
                    "message": "something went wrong"
                }), 400
            # Student added successfully into users table

        # 3. If student exists, check if he already registered to the course
        check_sql = "SELECT * FROM students WHERE email = %s AND course_id = %s"
        cursor.execute(check_sql, (email, course_id))
        check_result = cursor.fetchall()

        if check_result and len(check_result) > 0:
            connection.rollback()
            cursor.close()
            return jsonify({
                "success": False,
                "message": "You're already enrolled in this course."
            }), 400

        # 4. If record not found, then add the data into students table (ie, registers for course)
        register_sql = """
            INSERT INTO students (email, course_id, name, mobile_no)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(register_sql, (email, course_id, name, mobile_no))
        if cursor.rowcount == 0:
            connection.rollback()
            cursor.close()
            return jsonify({
                "success": False,
                "message": "something went wrong"
            }), 400

        connection.commit()
        cursor.close()
        return jsonify({
            "success": True,
            "message": "Registration to course successful."
        }), 200

    except mysql.connector.Error as exc:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    finally:
        connection.close()


@students_bp.put("/change-password/<email>")
def change_password(email: str):
    """PUT: change password"""
    payload = request.get_json(silent=True) or {}
    new_password = payload.get("newPassword") or payload.get("new_password")
    confirm_password = payload.get("confirmPassword") or payload.get("confirm_password")

    if not new_password or not confirm_password:
        return jsonify({
            "success": False,
            "message": "newPassword and confirmPassword are required"
        }), 400

    if new_password != confirm_password:
        return jsonify({
            "success": False,
            "message": "New password and confirmation do not match!"
        }), 400

    hash_password = hash_password_sha256(new_password)
    sql = "UPDATE users SET password = %s WHERE email = %s"

    connection = Database.get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, (hash_password, email))
            if cursor.rowcount == 0:
                return jsonify({
                    "success": True,
                    "message": "Incorrect email."
                }), 200

        connection.commit()
        return jsonify({
            "success": True,
            "message": "Password updated successfully."
        }), 200

    except mysql.connector.Error as exc:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    finally:
        connection.close()

