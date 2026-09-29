import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { IMAGES } from "../config/images.js";
import PageHero from "../components/PageHero.jsx";
import Field from "../components/Field.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function Report() {
  const { user } = useAuth();
  const toast = useToast();
  const blank = { product: "", brand: "", location: "", report_date: today(), description: "", contact: user?.email || "" };
  const [f, setF] = useState(blank);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (e) => {
    const x = e.target.files[0];
    if (!x) return;
    if (!/^image\/(png|jpeg|webp)$/.test(x.type) || x.size > 5 * 1024 * 1024) {
      e.target.value = "";
      return setErrors({ ...errors, image: "Use a PNG, JPG or WEBP image under 5 MB." });
    }
    setErrors({ ...errors, image: "" }); setFile(x); setPreview(URL.createObjectURL(x));
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (f.product.trim().length < 2) v.product = "Enter the product name.";
    if (f.description.trim().length < 10) v.description = "Describe what you noticed (at least 10 characters).";
    if (f.contact.trim().length < 5) v.contact = "Enter a phone number or email.";
    if (!f.report_date || f.report_date > today()) v.report_date = "Choose a valid date that is not in the future.";
    setErrors(v);
    if (Object.keys(v).length) return;
    const fd = new FormData();
    Object.entries(f).forEach(([k, val]) => fd.append(k, val));
    if (file) fd.append("image", file);
    setBusy(true);
    try { const r = await api.submitReport(fd); setDone(r.report_code); toast("Report submitted."); }
    catch (err) { setErrors(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); }
  };

  const again = () => { setDone(null); setF(blank); setFile(null); setPreview(null); };

  return (
    <>
      <PageHero image={IMAGES.report} title="Report Suspected Adulteration" subtitle="Tell us what you found. Photos and details help reviewers act faster." />
      <div className="container section narrow">
        {done ? (
          <div className="card pad-lg success">
            <CheckCircle2 size={48} /><h2>Report submitted</h2>
            <p>Your report ID is</p><div className="code">{done}</div>
            <p className="muted">Save this ID. You can follow its status in My Reports.</p>
            <div className="hero-actions center"><Link className="btn btn-primary" to="/my-reports">View my reports</Link><button className="btn btn-ghost" onClick={again}>Report another</button></div>
          </div>
        ) : (
          <form className="card pad-lg" onSubmit={submit} noValidate>
            <div className="grid g2">
              <Field label="Food / product name" error={errors.product}><input value={f.product} onChange={set("product")} /></Field>
              <Field label="Brand name"><input value={f.brand} onChange={set("brand")} /></Field>
              <Field label="Shop / location"><input value={f.location} onChange={set("location")} /></Field>
              <Field label="Date" error={errors.report_date}><input type="date" max={today()} value={f.report_date} onChange={set("report_date")} /></Field>
            </div>
            <Field label="Description" error={errors.description}><textarea rows="4" value={f.description} onChange={set("description")} placeholder="What looked, smelled or tasted wrong?" /></Field>
            <Field label="Contact details" error={errors.contact}><input value={f.contact} onChange={set("contact")} /></Field>
            <Field label="Photo (optional)" error={errors.image} hint="PNG, JPG or WEBP, up to 5 MB."><input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} /></Field>
            {preview && <img className="thumb-lg" src={preview} alt="Report attachment preview" />}
            <button className="btn btn-orange block" disabled={busy}>{busy ? "Submitting..." : "Submit report"}</button>
          </form>
        )}
      </div>
    </>
  );
}
