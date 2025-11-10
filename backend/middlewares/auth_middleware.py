from __future__ import annotations

from functools import wraps

import jwt
from flask import jsonify, request

from backend.utils.jwt_helper import decode_token


def check_admin_role(f):
    """Decorator to check if the user has admin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return jsonify({
                "success": False,
                "message": "Authorization header is missing"
            }), 401
        
        # Extract token from "Bearer <token>" format
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        except IndexError:
            return jsonify({
                "success": False,
                "message": "Invalid authorization header format"
            }), 401
        
        try:
            decoded = decode_token(token)
            role = decoded.get("role")
            
            if role != "admin":
                return jsonify({
                    "success": False,
                    "message": "Access denied. Admin role required."
                }), 403
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Token has expired"
            }), 401
        except jwt.InvalidTokenError as e:
            return jsonify({
                "success": False,
                "message": f"Invalid token: {str(e)}"
            }), 401
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authentication error: {str(e)}"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

