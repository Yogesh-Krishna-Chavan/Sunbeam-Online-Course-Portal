from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.db import execute_query
from backend.utils.jwt_helper import create_access_token
from backend.utils.password import hash_password_sha256


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    """POST: user login (student, admin)"""
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    # Hash password using SHA256 (matches crypto-js.SHA256)
    hash_password = hash_password_sha256(password)

    # Query user with email and hashed password
    sql = "SELECT * FROM users WHERE email = %s AND password = %s"
    results = execute_query(sql, (email, hash_password))

    # If user does not exist
    if not results or len(results) == 0:
        return jsonify({"success": False, "message": "Invalid email or password!"}), 401

    # If user exists
    user = results[0]

    # Create token
    token = create_access_token(user["email"], {"role": user.get("role", "student")})

    return jsonify({
        "success": True,
        "message": "login successful",
        "data": {"token": token}
    }), 200

