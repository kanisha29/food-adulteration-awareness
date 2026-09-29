import os
from flask import Flask, jsonify, send_from_directory
import config
from database.db import init_db, close_db


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH
    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    init_db()
    app.teardown_appcontext(close_db)

    from routes.auth import bp as auth_bp
    from routes.foods import bp as foods_bp
    from routes.reports import bp as reports_bp
    from routes.admin import bp as admin_bp
    for bp in (auth_bp, foods_bp, reports_bp, admin_bp):
        app.register_blueprint(bp)

    @app.get("/api/uploads/<path:filename>")
    def uploads(filename):
        return send_from_directory(config.UPLOAD_DIR, filename)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.after_request
    def cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = config.CORS_ORIGIN
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return resp

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Not found."), 404

    @app.errorhandler(405)
    def bad_method(_e):
        return jsonify(error="Method not allowed."), 405

    @app.errorhandler(413)
    def too_large(_e):
        return jsonify(error="Upload is too large (max 5 MB)."), 413

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify(error="Unexpected server error."), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
