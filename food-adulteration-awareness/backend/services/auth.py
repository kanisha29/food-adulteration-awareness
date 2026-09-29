from functools import wraps
from flask import request, jsonify, current_app, g
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import config
from database.db import query


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="auth-token")


def make_token(identity_id, role):
    return _serializer().dumps({"id": identity_id, "role": role})


def current_identity(role):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = _serializer().loads(header[7:], max_age=config.TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None
    if data.get("role") != role:
        return None
    table = "admins" if role == "admin" else "users"
    return query(f"SELECT * FROM {table} WHERE id = ?", (data["id"],), one=True)


def login_required(role="user"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            who = current_identity(role)
            if not who:
                return jsonify(error="Please sign in to continue."), 401
            g.identity = who
            return fn(*args, **kwargs)
        return wrapper
    return decorator
