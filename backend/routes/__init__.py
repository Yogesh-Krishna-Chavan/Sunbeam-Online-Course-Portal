from flask import Flask

from backend.routes.authRoutes import auth_bp
from backend.routes.courseRoutes import courses_bp
from backend.routes.studentsRoutes import students_bp
from backend.routes.videoRoutes import videos_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(videos_bp, url_prefix="/api/videos")

