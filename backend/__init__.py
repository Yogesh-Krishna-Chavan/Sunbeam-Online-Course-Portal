"""Application factory for the Sunbeam Online Course Portal backend."""

from flask import Flask

from backend.config.settings import settings
from backend.routes import register_blueprints


def create_app() -> Flask:
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.secret_key

    register_blueprints(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app


