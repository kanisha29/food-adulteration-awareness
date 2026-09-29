import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import Modal from "../components/Modal.jsx";
import Field from "../components/Field.jsx";
import Loader from "../components/Loader.jsx";

const EMPTY = { name: "", category: "", icon: "", why: "", warning_signs: "", detection: "", health_effects: "", prevention: "", recommendations: "", adulterants: "" };
const AREAS = [["why", "Why adulteration occurs"], ["warning_signs", "Possible warning signs"], ["detection", "Detection information"], ["health_effects", "Health information"], ["prevention", "Prevention tips"], ["recommendations", "Safety recommendations"]];

export default function AdminFoods() {
  const [foods, setFoods] = useState(null);
  const [editing, setEditing] = useState(null); // {id?} form state
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const load = () => api.foods().then((r) => setFoods(r.foods)).catch((e) => toast(e.message, "error"));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openForm = (food) => {
    setError(""); setFile(null);
    setEditing(food ? { ...EMPTY, ...food, adulterants: food.adulterants.map((a) => a.name + (a.description ? " - " + a.description : "")).join("\n") } : { ...EMPTY });
  };
  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (editing.name.trim().length < 2 || editing.category.trim().length < 2) return setError("Name and category are required.");
    const fd = new FormData();
    Object.keys(EMPTY).forEach((k) => fd.append(k, editing[k] || ""));
    if (file) fd.append("image", file);
    setBusy(true);
    try { await api.admin.saveFood(editing.id, fd); toast(editing.id ? "Food updated." : "Food added."); setEditing(null); load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    try { await api.admin.deleteFood(del.id); toast("Food deleted."); setDel(null); load(); }
    catch (err) { toast(err.message, "error"); }
  };

  return (
    <>
      <div className="row-between"><h1 className="admin-title">Food management</h1><button className="btn btn-primary" onClick={() => openForm(null)}><Plus size={18} /> Add food</button></div>
      {foods === null ? <Loader /> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Food</th><th>Category</th><th>Adulterants</th><th className="right">Actions</th></tr></thead>
            <tbody>{foods.map((f) => (
              <tr key={f.id}><td>{f.icon} <b>{f.name}</b></td><td>{f.category}</td><td>{f.adulterants.length}</td>
                <td className="right"><button className="icon-btn" aria-label={`Edit ${f.name}`} onClick={() => openForm(f)}><Pencil size={16} /></button>
                  <button className="icon-btn danger" aria-label={`Delete ${f.name}`} onClick={() => setDel(f)}><Trash2 size={16} /></button></td></tr>))}</tbody>
          </table>
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit food" : "Add food"} wide>
        {editing && (
          <form onSubmit={save} noValidate>
            {error && <div className="alert">{error}</div>}
            <div className="grid g3">
              <Field label="Name"><input value={editing.name} onChange={set("name")} /></Field>
              <Field label="Category"><input list="cats" value={editing.category} onChange={set("category")} /></Field>
              <Field label="Emoji icon"><input value={editing.icon} onChange={set("icon")} maxLength={4} /></Field>
            </div>
            <datalist id="cats">{[...new Set((foods || []).map((f) => f.category))].map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Food image" hint="PNG, JPG or WEBP up to 5 MB. Leave empty to keep the current image."><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} /></Field>
            <Field label="Adulterants" hint='One per line. Optional description after " - ", e.g. Chalk powder - white filler'><textarea rows="4" value={editing.adulterants} onChange={set("adulterants")} /></Field>
            {AREAS.map(([k, l]) => <Field key={k} label={l}><textarea rows="2" value={editing[k]} onChange={set(k)} /></Field>)}
            <button className="btn btn-primary block" disabled={busy}>{busy ? "Saving..." : "Save food"}</button>
          </form>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete food?">
        <p>This permanently removes <b>{del?.name}</b> and its adulterant list.</p>
        <div className="hero-actions"><button className="btn btn-danger" onClick={remove}>Delete</button><button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button></div>
      </Modal>
    </>
  );
}
