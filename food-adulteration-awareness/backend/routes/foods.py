from flask import Blueprint, request, jsonify, g
from database.db import query, execute
from services.auth import current_identity, login_required
from services.food_service import list_foods, get_food
from services.uploads import validate_image
from services.ai_service import analyze_image
import config

bp = Blueprint("foods", __name__, url_prefix="/api")


@bp.get("/foods")
def foods():
    return jsonify(foods=list_foods(request.args.get("q", "").strip(), request.args.get("category", "").strip()))


@bp.get("/foods/<int:food_id>")
def food_detail(food_id):
    food = get_food(food_id)
    if not food:
        return jsonify(error="Food not found."), 404
    user = current_identity("user")
    if user:
        execute("INSERT INTO search_history (user_id, food_id, query) VALUES (?,?,?)", (user["id"], food_id, food["name"]))
    return jsonify(food=food, disclaimer=config.DISCLAIMER)


@bp.get("/categories")
def categories():
    return jsonify(categories=query("SELECT category AS name, COUNT(*) AS count FROM foods GROUP BY category ORDER BY category"))


@bp.get("/adulterants")
def adulterants():
    fid = request.args.get("food_id", type=int)
    sql = "SELECT a.id, a.name, a.description, f.name AS food FROM adulterants a JOIN foods f ON f.id = a.food_id"
    rows = query(sql + (" WHERE a.food_id = ?" if fid else ""), (fid,) if fid else ())
    return jsonify(adulterants=rows)


@bp.get("/articles")
def articles():
    return jsonify(articles=query("SELECT * FROM awareness_articles ORDER BY id"))


@bp.get("/stats")
def stats():
    one = lambda t: query(f"SELECT COUNT(*) AS c FROM {t}", one=True)["c"]
    return jsonify(users=one("users"), foods=one("foods"), reports=one("reports"), articles=one("awareness_articles"))


@bp.get("/history")
@login_required("user")
def history():
    rows = query("""SELECT MAX(h.created_at) AS created_at, h.food_id, h.query, f.icon FROM search_history h
                    LEFT JOIN foods f ON f.id = h.food_id WHERE h.user_id = ?
                    GROUP BY h.query ORDER BY MAX(h.created_at) DESC LIMIT 6""", (g.identity["id"],))
    return jsonify(history=rows)


@bp.post("/analyze")
@login_required("user")
def analyze():
    file = request.files.get("image")
    if not file or not file.filename:
        return jsonify(error="Please choose an image to analyse."), 400
    try:
        _ext, data = validate_image(file)
    except ValueError as e:
        return jsonify(error=str(e)), 400
    return jsonify(result=analyze_image(data, request.form.get("food", "")))
