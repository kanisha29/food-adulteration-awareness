import random
from datetime import date, datetime
from flask import Blueprint, request, jsonify, g
from database.db import query, execute
from services.auth import login_required
from services.uploads import save_image

bp = Blueprint("reports", __name__, url_prefix="/api")


def with_images(reports):
    for r in reports:
        r["images"] = [i["filename"] for i in query("SELECT filename FROM report_images WHERE report_id = ?", (r["id"],))]
    return reports


def new_code():
    while True:
        code = f"FAR-{datetime.now():%Y%m%d}-{random.randint(1000, 9999)}"
        if not query("SELECT 1 FROM reports WHERE report_code = ?", (code,), one=True):
            return code


@bp.post("/reports")
@login_required("user")
def submit_report():
    f = request.form
    product, desc, contact = f.get("product", "").strip(), f.get("description", "").strip(), f.get("contact", "").strip()
    rdate, errors = f.get("report_date", "").strip(), {}
    if len(product) < 2: errors["product"] = "Enter the product name."
    if len(desc) < 10: errors["description"] = "Describe what you noticed (at least 10 characters)."
    if len(contact) < 5: errors["contact"] = "Enter a phone number or email."
    try:
        if datetime.strptime(rdate, "%Y-%m-%d").date() > date.today():
            errors["report_date"] = "Date cannot be in the future."
    except ValueError:
        errors["report_date"] = "Choose a valid date."
    file = request.files.get("image")
    filename = None
    if not errors and file and file.filename:
        try:
            filename = save_image(file)
        except ValueError as e:
            errors["image"] = str(e)
    if errors:
        return jsonify(error="Please fix the highlighted fields.", fields=errors), 400
    code = new_code()
    rid = execute("""INSERT INTO reports (report_code, user_id, product, brand, location, report_date, description, contact)
                     VALUES (?,?,?,?,?,?,?,?)""",
                  (code, g.identity["id"], product, f.get("brand", "").strip(), f.get("location", "").strip(), rdate, desc, contact))
    if filename:
        execute("INSERT INTO report_images (report_id, filename) VALUES (?,?)", (rid, filename))
    return jsonify(report_code=code, message="Report submitted."), 201


@bp.get("/reports")
@login_required("user")
def my_reports():
    rows = query("SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC", (g.identity["id"],))
    return jsonify(reports=with_images(rows))
