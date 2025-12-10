"""Application factory for the Sunbeam Online Course Portal backend."""

from flask import Flask
from flask_cors import CORS

from backend.config.settings import settings
from backend.routes import register_blueprints


def create_app() -> Flask:
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.secret_key
    
    # Enable CORS for frontend integration
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

    register_blueprints(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app


