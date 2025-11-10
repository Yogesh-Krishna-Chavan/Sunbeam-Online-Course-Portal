from __future__ import annotations

from datetime import datetime, timedelta

import mysql.connector
from flask import Blueprint, jsonify, request

from backend.db import Database, execute_query
from backend.middlewares.auth_middleware import check_admin_role

VIDEO_TABLE = "videos"
COURSE_TABLE = "courses"
STUDENT_TABLE = "students"

videos_bp = Blueprint("videos", __name__)


@videos_bp.get("/all/<string:email>/<int:course_id>")
def get_videos_for_student(email: str, course_id: int):
    """GET: get all videos of a course registered by a student."""
    sql = f"""
        SELECT v.video_id, v.course_id, v.title, v.youtube_url, v.description, v.added_at,
               c.video_expire_days
        FROM {VIDEO_TABLE} AS v
        INNER JOIN {STUDENT_TABLE} AS s ON s.course_id = v.course_id
        INNER JOIN {COURSE_TABLE} AS c ON c.course_id = v.course_id
        WHERE s.email = %s AND s.course_id = %s
    """

    try:
        results = execute_query(sql, (email, course_id))

        if not results:
            return jsonify({
                "success": True,
                "message": "No videos available for this course."
            }), 200

        now = datetime.now()
        filtered_videos: list[dict] = []
        for video in results:
            added_at = video.get("added_at")
            expire_days = video.get("video_expire_days") or 0

            if added_at is None:
                filtered_videos.append(video)
                continue

            expiry_date = added_at + timedelta(days=expire_days)
            if expiry_date >= now:
                filtered_videos.append(video)

        if not filtered_videos:
            return jsonify({
                "success": True,
                "message": "No active videos available for this course."
            }), 200

        return jsonify({
            "success": True,
            "data": filtered_videos
        }), 200

    except mysql.connector.Error as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500


@videos_bp.get("/all-videos")
@check_admin_role
def get_all_videos():
    """GET: get all videos (admin) with optional courseId filter."""
    course_id = request.args.get("courseId")

    sql = f"SELECT * FROM {VIDEO_TABLE}"
    params: list = []

    if course_id:
        sql += " WHERE course_id = %s"
        params.append(course_id)

    try:
        results = execute_query(sql, tuple(params) if params else None)

        if not results:
            return jsonify({
                "success": True,
                "message": "No videos found."
            }), 200

        return jsonify({
            "success": True,
            "data": results
        }), 200

    except mysql.connector.Error as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500


@videos_bp.post("/add")
@check_admin_role
def add_video():
    """POST: add new video to a course."""
    payload = request.get_json(silent=True) or {}
    course_id = payload.get("courseId") or payload.get("course_id")
    title = payload.get("title")
    description = payload.get("description")
    youtube_url = payload.get("youtubeURL") or payload.get("youtube_url")

    if not course_id or not title or not youtube_url:
        return jsonify({
            "success": False,
            "message": "courseId, title, and youtubeURL are required"
        }), 400

    sql_course = f"SELECT course_id FROM {COURSE_TABLE} WHERE course_id = %s"

    try:
        course_results = execute_query(sql_course, (course_id,))
        if not course_results:
            return jsonify({
                "success": False,
                "message": f"No course found with Id: {course_id}"
            }), 404

        insert_video_sql = f"""
            INSERT INTO {VIDEO_TABLE} (course_id, title, youtube_url, description)
            VALUES (%s, %s, %s, %s)
        """

        connection = Database.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(insert_video_sql, (course_id, title, youtube_url, description))
                if cursor.rowcount == 0:
                    connection.rollback()
                    return jsonify({
                        "success": False,
                        "message": "Something went wrong while adding the video."
                    }), 400

            connection.commit()
            return jsonify({
                "success": True,
                "message": "Video added successfully."
            }), 200

        except mysql.connector.Error as exc:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": str(exc)
            }), 400
        finally:
            connection.close()

    except mysql.connector.Error as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500


@videos_bp.put("/update/<int:video_id>")
@check_admin_role
def update_video(video_id: int):
    """PUT: update a video of a course by videoId."""
    payload = request.get_json(silent=True) or {}
    course_id = payload.get("courseId") or payload.get("course_id")
    title = payload.get("title")
    description = payload.get("description")
    youtube_url = payload.get("youtubeURL") or payload.get("youtube_url")

    if not course_id or not title or not youtube_url:
        return jsonify({
            "success": False,
            "message": "courseId, title, and youtubeURL are required"
        }), 400

    sql_course = f"SELECT course_id FROM {COURSE_TABLE} WHERE course_id = %s"

    try:
        course_results = execute_query(sql_course, (course_id,))
        if not course_results:
            return jsonify({
                "success": False,
                "message": f"No course found with Id: {course_id}"
            }), 404

        update_video_sql = f"""
            UPDATE {VIDEO_TABLE}
            SET course_id = %s, title = %s, youtube_url = %s, description = %s
            WHERE video_id = %s
        """

        connection = Database.get_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(update_video_sql, (course_id, title, youtube_url, description, video_id))
                if cursor.rowcount == 0:
                    connection.rollback()
                    return jsonify({
                        "success": False,
                        "message": f"No video found with Id: {video_id}"
                    }), 404

            connection.commit()
            return jsonify({
                "success": True,
                "message": "Video updated successfully."
            }), 200

        except mysql.connector.Error as exc:
            connection.rollback()
            return jsonify({
                "success": False,
                "message": str(exc)
            }), 400
        finally:
            connection.close()

    except mysql.connector.Error as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    except Exception as exc:
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500


@videos_bp.delete("/delete/<int:video_id>")
@check_admin_role
def delete_video(video_id: int):
    """DELETE: delete a video of a course by videoId."""
    delete_video_sql = f"DELETE FROM {VIDEO_TABLE} WHERE video_id = %s"

    connection = Database.get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(delete_video_sql, (video_id,))
            if cursor.rowcount == 0:
                connection.rollback()
                return jsonify({
                    "success": False,
                    "message": f"No video found with Id: {video_id}"
                }), 404

        connection.commit()
        return jsonify({
            "success": True,
            "message": "Video deleted successfully."
        }), 200

    except mysql.connector.Error as exc:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 400
    except Exception as exc:
        connection.rollback()
        return jsonify({
            "success": False,
            "message": str(exc)
        }), 500
    finally:
        connection.close()
