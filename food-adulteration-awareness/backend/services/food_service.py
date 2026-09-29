from database.db import query, get_db


def _attach(foods):
    if not foods:
        return foods
    ids = [f["id"] for f in foods]
    rows = query(f"SELECT * FROM adulterants WHERE food_id IN ({','.join('?' * len(ids))}) ORDER BY id", ids)
    by_food = {}
    for r in rows:
        by_food.setdefault(r["food_id"], []).append({"id": r["id"], "name": r["name"], "description": r["description"]})
    for f in foods:
        f["adulterants"] = by_food.get(f["id"], [])
    return foods


def list_foods(q="", category=""):
    sql, args = "SELECT DISTINCT f.* FROM foods f LEFT JOIN adulterants a ON a.food_id = f.id WHERE 1=1", []
    if q:
        sql += " AND (f.name LIKE ? OR f.category LIKE ? OR a.name LIKE ?)"
        args += [f"%{q}%"] * 3
    if category:
        sql += " AND f.category = ?"
        args.append(category)
    return _attach(query(sql + " ORDER BY f.name", args))


def get_food(food_id):
    row = query("SELECT * FROM foods WHERE id = ?", (food_id,), one=True)
    return _attach([row])[0] if row else None


def save_adulterants(food_id, text):
    """Each line: 'Name - optional description'."""
    db = get_db()
    db.execute("DELETE FROM adulterants WHERE food_id = ?", (food_id,))
    for line in (text or "").splitlines():
        line = line.strip()
        if not line:
            continue
        name, _, desc = line.partition(" - ")
        db.execute("INSERT INTO adulterants (food_id, name, description) VALUES (?, ?, ?)",
                   (food_id, name.strip()[:120], desc.strip()[:400]))
    db.commit()
