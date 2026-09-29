from flask import Blueprint, request, jsonify
from database.db import query, execute
from services.auth import login_required
from services.food_service import get_food, save_adulterants
from services.uploads import save_image
from routes.reports import with_images

bp = Blueprint("admin", __name__, url_prefix="/api/admin")
STATUSES = ("pending", "in_review", "resolved")
TEXT_FIELDS = ("why", "health_effects", "warning_signs", "detection", "prevention", "recommendations")


def _food_from_form(existing=None):
    f = request.form
    name, category = f.get("name", "").strip(), f.get("category", "").strip()
    if len(name) < 2 or len(category) < 2:
        return None, ({"error": "Food name and category are required."}, 400)
    values = {k: f.get(k, "").strip() for k in TEXT_FIELDS}
    values.update(name=name, category=category, icon=f.get("icon", "").strip() or "🍽️",
                  image=existing["image"] if existing else None)
    file = request.files.get("image")
    if file and file.filename:
        try:
            values["image"] = save_image(file)
        except ValueError as e:
            return None, ({"error": str(e)}, 400)
    return values, None


@bp.get("/stats")
@login_required("admin")
def stats():
    one = lambda sql: query(sql, one=True)["c"]
    by_status = {s: one(f"SELECT COUNT(*) AS c FROM reports WHERE status = '{s}'") for s in STATUSES}
    return jsonify(
        users=one("SELECT COUNT(*) AS c FROM users"), foods=one("SELECT COUNT(*) AS c FROM foods"),
        reports=one("SELECT COUNT(*) AS c FROM reports"), by_status=by_status,
        categories=query("SELECT category AS name, COUNT(*) AS count FROM foods GROUP BY category ORDER BY count DESC"),
        daily=query("SELECT report_date AS day, COUNT(*) AS count FROM reports GROUP BY report_date ORDER BY report_date DESC LIMIT 7")[::-1],
        recent=query("""SELECT r.report_code, r.product, r.status, r.report_date, u.full_name FROM reports r
                        JOIN users u ON u.id = r.user_id ORDER BY r.id DESC LIMIT 5"""))


@bp.post("/foods")
@login_required("admin")
def add_food():
    v, err = _food_from_form()
    if err: return jsonify(**err[0]), err[1]
    cols = list(v)
    fid = execute(f"INSERT INTO foods ({','.join(cols)}) VALUES ({','.join('?' * len(cols))})", [v[c] for c in cols])
    save_adulterants(fid, request.form.get("adulterants", ""))
    return jsonify(food=get_food(fid)), 201


@bp.put("/foods/<int:fid>")
@login_required("admin")
def edit_food(fid):
    existing = get_food(fid)
    if not existing: return jsonify(error="Food not found."), 404
    v, err = _food_from_form(existing)
    if err: return jsonify(**err[0]), err[1]
    execute(f"UPDATE foods SET {','.join(c + '=?' for c in v)} WHERE id = ?", [*v.values(), fid])
    save_adulterants(fid, request.form.get("adulterants", ""))
    return jsonify(food=get_food(fid))


@bp.delete("/foods/<int:fid>")
@login_required("admin")
def delete_food(fid):
    if not get_food(fid): return jsonify(error="Food not found."), 404
    execute("DELETE FROM foods WHERE id = ?", (fid,))
    return jsonify(message="Food deleted.")


@bp.get("/reports")
@login_required("admin")
def all_reports():
    status = request.args.get("status", "")
    sql = "SELECT r.*, u.full_name AS user_name, u.email AS user_email FROM reports r JOIN users u ON u.id = r.user_id"
    rows = query(sql + (" WHERE r.status = ?" if status in STATUSES else "") + " ORDER BY r.id DESC", (status,) if status in STATUSES else ())
    return jsonify(reports=with_images(rows))


@bp.put("/reports/<int:rid>")
@login_required("admin")
def update_report(rid):
    d = request.get_json(silent=True) or {}
    if d.get("status") not in STATUSES:
        return jsonify(error="Status must be pending, in_review or resolved."), 400
    if not query("SELECT id FROM reports WHERE id = ?", (rid,), one=True):
        return jsonify(error="Report not found."), 404
    execute("UPDATE reports SET status = ?, remarks = ? WHERE id = ?", (d["status"], (d.get("remarks") or "").strip()[:1000], rid))
    return jsonify(message="Report updated.")
