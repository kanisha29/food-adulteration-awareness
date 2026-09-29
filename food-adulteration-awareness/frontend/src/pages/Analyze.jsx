import { useEffect, useRef, useState } from "react";
import { UploadCloud, ScanSearch } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { IMAGES, bg } from "../config/images.js";

const LEVEL_COLOR = { Low: "#2f9e63", Moderate: "#f28c28", Elevated: "#d9482b" };

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [foods, setFoods] = useState([]);
  const [food, setFood] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const toast = useToast();

  useEffect(() => { api.foods().then((r) => setFoods(r.foods)).catch(() => {}); }, []);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (f) => {
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return toast("Choose a PNG, JPG or WEBP image.", "error");
    if (f.size > 5 * 1024 * 1024) return toast("Image must be smaller than 5 MB.", "error");
    setFile(f); setResult(null); setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file) return toast("Upload an image first.", "error");
    const fd = new FormData();
    fd.append("image", file); fd.append("food", food);
    setBusy(true); setResult(null);
    try { await new Promise((r) => setTimeout(r, 1200)); setResult((await api.analyze(fd)).result); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  };

  return (
    <>
      <section className="page-hero" style={bg(IMAGES.analysis, "rgba(6,30,44,.92)", "rgba(6,30,44,.55)")}>
        <div className="container"><h1>AI Food Image Analysis</h1><p>Upload a photo to see possible visual indicators. This is an educational screening, not a test.</p></div>
      </section>
      <div className="container section analyze">
        <div className="card pad-lg">
          <div className={"drop" + (drag ? " drag" : "")} onClick={() => input.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && input.current.click()}>
            {preview ? <img src={preview} alt="Selected food preview" /> : <><UploadCloud size={40} /><p>Drop a food image here or click to browse</p><small>PNG, JPG or WEBP up to 5 MB</small></>}
          </div>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files[0])} />
          <label className="field"><span>Food type (optional)</span>
            <select value={food} onChange={(e) => setFood(e.target.value)}><option value="">Not sure</option>{foods.map((f) => <option key={f.id}>{f.name}</option>)}</select>
          </label>
          <button className="btn btn-primary block" onClick={analyze} disabled={busy}><ScanSearch size={18} /> {busy ? "Analysing..." : "Analyse image"}</button>
        </div>
        <div className="card pad-lg result">
          {busy && <div className="scan"><div className="scan-line" /><p>Looking for visual indicators...</p></div>}
          {!busy && !result && <div className="empty"><h3>No result yet</h3><p>Upload an image and press Analyse to see educational indicators here.</p></div>}
          {result && (
            <>
              <div className="level" style={{ "--c": LEVEL_COLOR[result.indicator_level] }}>
                <span>Indicator level</span><strong>{result.indicator_level}</strong>
                <div className="meter"><i style={{ width: `${result.confidence}%` }} /></div>
                <small>Indicator score {result.confidence} / 100</small>
              </div>
              <h4>Possible visual indicators</h4>
              <ul className="adulterants">{result.indicators.map((i) => <li key={i.title}><strong>{i.title}</strong><span>{i.detail}</span></li>)}</ul>
              <h4>Safety recommendations</h4>
              <ul className="plain">{result.recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
              <div className="alert info">{result.note}</div>
              <div className="disclaimer">{result.disclaimer}</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
