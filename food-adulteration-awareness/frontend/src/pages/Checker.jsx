import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api, DISCLAIMER } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { IMAGES, bg } from "../config/images.js";
import Loader from "../components/Loader.jsx";
import FoodDetail from "../components/FoodDetail.jsx";

export default function Checker() {
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get("q") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const auto = useRef(!!params.get("q"));
  const panel = useRef(null);
  const toast = useToast();

  useEffect(() => { const t = setTimeout(() => setQ(text.trim()), 250); return () => clearTimeout(t); }, [text]);

  const choose = async (f) => {
    setBusyId(f.id);
    try { setSel((await api.food(f.id)).food); setTimeout(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    catch (e) { toast(e.message, "error"); } finally { setBusyId(null); }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.foods(q).then((r) => {
      if (!alive) return;
      setFoods(r.foods);
      if (auto.current && r.foods.length) { auto.current = false; choose(r.foods[0]); }
    }).catch((e) => toast(e.message, "error")).finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <>
      <section className="page-hero" style={bg(IMAGES.checker)}>
        <div className="container"><h1>Food Adulteration Checker</h1><p>Pick a food to see common adulterants, warning signs and prevention tips.</p></div>
      </section>
      <div className="container section">
        <div className="disclaimer top">{DISCLAIMER}</div>
        <div className="checker">
          <aside className="list-panel card">
            <div className="searchbar light"><Search size={18} /><input placeholder="Search foods or adulterants" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search foods" /></div>
            {loading ? <Loader /> : (
              <ul className="food-list">
                {foods.map((f) => (
                  <li key={f.id}><button className={sel?.id === f.id ? "active" : ""} onClick={() => choose(f)} disabled={busyId === f.id}>
                    <span>{f.icon}</span><b>{f.name}</b><small>{f.category}</small></button></li>
                ))}
                {!foods.length && <li className="muted pad">No foods match your search.</li>}
              </ul>
            )}
          </aside>
          <div className="detail-panel card" ref={panel}>
            {sel ? <FoodDetail food={sel} /> : <div className="empty"><h3>Select a food</h3><p>Choose an item from the list to see educational details.</p></div>}
          </div>
        </div>
      </div>
    </>
  );
}
