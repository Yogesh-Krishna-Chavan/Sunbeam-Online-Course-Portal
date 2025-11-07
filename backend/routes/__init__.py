from flask import Flask

from backend.routes.auth_routes import auth_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

