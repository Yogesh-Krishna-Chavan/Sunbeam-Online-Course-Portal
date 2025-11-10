from __future__ import annotations

from datetime import date, datetime

import mysql.connector
from flask import Blueprint, jsonify, request

from backend.db import Database, execute_query
from backend.middlewares.auth_middleware import check_admin_role

COURSE_TABLE = "courses"

courses_bp = Blueprint("courses", __name__)


@courses_bp.get("/all-active-courses")
def get_all_active_courses():
    """GET: get all active courses"""
    current_date = date.today()

    sql = f"SELECT * FROM {COURSE_TABLE} WHERE end_date >= %s"

    try:
        results = execute_query(sql, (current_date,))

        if not results or len(results) == 0:
            return jsonify({
                "success": True,
                "message": "No Courses Found."
            }), 200

        return jsonify({
            "success": True,
            "data": results
        }), 200

    except mysql.connector.Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@courses_bp.get("/all-courses")
@check_admin_role
def get_all_courses():
    """GET: get all courses (filter datewise)"""
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")

    sql = f"SELECT * FROM {COURSE_TABLE}"
    params = []

    # Add filters
    if start_date and end_date:
        sql += " WHERE start_date >= %s AND end_date <= %s"
        params.extend([start_date, end_date])
    elif start_date:
        sql += " WHERE start_date >= %s"
        params.append(start_date)
    elif end_date:
        sql += " WHERE end_date <= %s"
        params.append(end_date)

    try:
        results = execute_query(sql, tuple(params) if params else None)

        if not results or len(results) == 0:
            return jsonify({
                "success": True,
                "message": "No Records Found."
            }), 200

        return jsonify({
            "success": True,
            "data": results
        }), 200

    except mysql.connector.Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@courses_bp.post("/add")
@check_admin_role
def add_course():
    """POST: add a new course"""
    payload = request.get_json(silent=True) or {}
    course_name = payload.get("courseName") or payload.get("course_name")
    description = payload.get("description")
    fees = payload.get("fees")
    start_date = payload.get("startDate") or payload.get("start_date")
    end_date = payload.get("endDate") or payload.get("end_date")
    video_expire_days = payload.get("videoExpireDays") or payload.get("video_expire_days")

    sql = f"""INSERT INTO {COURSE_TABLE} 
            (course_name, description, fees, start_date, end_date, video_expire_days) 
            VALUES (%s, %s, %s, %s, %s, %s)"""

    connection = Database.get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            sql,
            (course_name, description, fees, start_date, end_date, video_expire_days)
        )
        connection.commit()
        cursor.close()
        return jsonify({
            "success": True,
            "message": "Course added successfully."
        }), 200

    except mysql.connector.Error as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        connection.close()


@courses_bp.put("/update/<int:course_id>")
@check_admin_role
def update_course(course_id: int):
    """PUT: update a course by courseId"""
    payload = request.get_json(silent=True) or {}
    course_name = payload.get("courseName") or payload.get("course_name")
    description = payload.get("description")
    fees = payload.get("fees")
    start_date = payload.get("startDate") or payload.get("start_date")
    end_date = payload.get("endDate") or payload.get("end_date")
    video_expire_days = payload.get("videoExpireDays") or payload.get("video_expire_days")

    sql = f"""UPDATE {COURSE_TABLE} 
        SET course_name = %s, description = %s, fees = %s, start_date = %s, end_date = %s, video_expire_days = %s 
        WHERE course_id = %s"""

    connection = Database.get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            sql,
            (course_name, description, fees, start_date, end_date, video_expire_days, course_id)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({
                "success": False,
                "message": f"No course found with Id: {course_id}"
            }), 404

        connection.commit()
        cursor.close()
        return jsonify({
            "success": True,
            "message": "Course updated successfully."
        }), 200

    except mysql.connector.Error as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        connection.close()


@courses_bp.delete("/delete/<int:course_id>")
@check_admin_role
def delete_course(course_id: int):
    """DELETE: delete a course by courseId"""
    sql = f"DELETE FROM {COURSE_TABLE} WHERE course_id = %s"

    connection = Database.get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(sql, (course_id,))

        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({
                "success": False,
                "message": f"No course found with Id: {course_id}"
            }), 404

        connection.commit()
        cursor.close()
        return jsonify({
            "success": True,
            "message": "Course deleted successfully."
        }), 200

    except mysql.connector.Error as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    finally:
        connection.close()

