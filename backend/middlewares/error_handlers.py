from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(err):
        return jsonify({"message": "Bad request", "detail": str(err)}), 400

    @app.errorhandler(401)
    def unauthorized(err):
        return jsonify({"message": "Unauthorized", "detail": str(err)}), 401

    @app.errorhandler(404)
    def not_found(err):
        return jsonify({"message": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(err):
        return jsonify({"message": "Internal server error"}), 500

