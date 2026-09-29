import re
from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import query, execute
from services.auth import make_token, login_required

bp = Blueprint("auth", __name__, url_prefix="/api")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def public_user(u):
    return {"id": u["id"], "full_name": u["full_name"], "email": u["email"], "phone": u["phone"]}


@bp.post("/auth/register")
def register():
    d = request.get_json(silent=True) or {}
    name, email = (d.get("full_name") or "").strip(), (d.get("email") or "").strip().lower()
    phone, pw = (d.get("phone") or "").strip(), d.get("password") or ""
    errors = {}
    if len(name) < 2: errors["full_name"] = "Enter your full name."
    if not EMAIL_RE.match(email): errors["email"] = "Enter a valid email address."
    if not re.fullmatch(r"\+?\d{10,14}", phone): errors["phone"] = "Enter a valid phone number (10-14 digits)."
    if len(pw) < 8 or not re.search(r"[A-Za-z]", pw) or not re.search(r"\d", pw):
        errors["password"] = "Use at least 8 characters with letters and numbers."
    if pw != d.get("confirm_password"): errors["confirm_password"] = "Passwords do not match."
    if errors:
        return jsonify(error="Please fix the highlighted fields.", fields=errors), 400
    if query("SELECT id FROM users WHERE email = ?", (email,), one=True):
        return jsonify(error="An account with this email already exists.", fields={"email": "Already registered."}), 409
    execute("INSERT INTO users (full_name, email, phone, password_hash) VALUES (?,?,?,?)",
            (name, email, phone, generate_password_hash(pw)))
    return jsonify(message="Account created. You can sign in now."), 201


@bp.post("/auth/login")
def login():
    d = request.get_json(silent=True) or {}
    ident, pw = (d.get("identifier") or "").strip().lower(), d.get("password") or ""
    if not ident or not pw:
        return jsonify(error="Enter your email and password."), 400
    user = query("SELECT * FROM users WHERE email = ? OR phone = ?", (ident, ident), one=True)
    if not user or not check_password_hash(user["password_hash"], pw):
        return jsonify(error="Incorrect email or password."), 401
    return jsonify(token=make_token(user["id"], "user"), user=public_user(user))


@bp.get("/auth/me")
@login_required("user")
def me():
    return jsonify(user=public_user(g.identity))


@bp.post("/auth/forgot")
def forgot():
    email = ((request.get_json(silent=True) or {}).get("email") or "").strip()
    if not EMAIL_RE.match(email):
        return jsonify(error="Enter a valid email address."), 400
    # Demo: no email server is configured. See README for connecting one.
    return jsonify(message="If this email is registered, reset instructions will be sent. (Demo: email sending is not configured.)")


@bp.post("/admin/login")
def admin_login():
    d = request.get_json(silent=True) or {}
    admin = query("SELECT * FROM admins WHERE username = ?", ((d.get("username") or "").strip(),), one=True)
    if not admin or not check_password_hash(admin["password_hash"], d.get("password") or ""):
        return jsonify(error="Incorrect admin username or password."), 401
    return jsonify(token=make_token(admin["id"], "admin"), admin={"id": admin["id"], "username": admin["username"]})
