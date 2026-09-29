import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { api } from "../services/api.js";
import { IMAGES } from "../config/images.js";
import PageHero from "../components/PageHero.jsx";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";

const DOS = ["Check licence, batch and expiry on every pack", "Buy from trusted, licensed sellers", "Wash fruit and vegetables well", "Keep bills and packaging for complaints", "Report suspicious products"];
const DONTS = ["Don't buy loose, unlabelled oil or ghee", "Don't judge quality by colour alone", "Don't ignore an unusual smell or taste", "Don't rely on one home test as proof", "Don't store food in damp places"];
const BUY = ["Prefer whole spices, pulses and grains", "Compare price with the usual market rate", "Look for intact seals and clean packaging", "Buy small quantities of powders"];
const STORE = ["Use airtight containers", "Keep away from moisture and sunlight", "Label opening dates", "Refrigerate dairy and cooked food promptly"];
const INFO = [["🥛", "Dilution", "Adding water to milk, honey or oil to raise volume."], ["🎨", "Colouring", "Dyes that make old or poor food look fresh."], ["🧱", "Fillers", "Cheap powders and grit added to spices and flour."], ["🔁", "Substitution", "Cheaper look-alike products replacing the real one."]];

const List = ({ items, icon: I, cls }) => <ul className={"checklist " + cls}>{items.map((t) => <li key={t}><I size={16} />{t}</li>)}</ul>;

export default function Awareness() {
  const [articles, setArticles] = useState(null);
  const [foods, setFoods] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    api.articles().then((r) => setArticles(r.articles)).catch(() => setArticles([]));
    api.foods().then((r) => setFoods(r.foods)).catch(() => {});
  }, []);
  return (
    <>
      <PageHero image={IMAGES.awareness} title="Food Safety Awareness" subtitle="Simple knowledge that helps you shop, store and eat safely." />
      <div className="container section">
        <h2 className="section-title">How food gets adulterated</h2>
        <div className="grid g4">{INFO.map(([e, t, d]) => <div className="card info-card" key={t}><span className="art-icon">{e}</span><h3>{t}</h3><p>{d}</p></div>)}</div>

        <h2 className="section-title">Articles</h2>
        {articles === null ? <Loader /> : (
          <div className="grid g3">{articles.map((a) => (
            <button key={a.id} className="card article" onClick={() => setOpen(a)}>
              <span className="art-icon">{a.icon}</span><span className="chip">{a.category}</span><h3>{a.title}</h3><p>{a.summary}</p>
            </button>))}</div>
        )}

        <h2 className="section-title">Do's and Don'ts</h2>
        <div className="grid g2">
          <div className="card pad-lg"><h3>Do</h3><List items={DOS} icon={Check} cls="good" /></div>
          <div className="card pad-lg"><h3>Don't</h3><List items={DONTS} icon={X} cls="bad" /></div>
        </div>

        <div className="grid g2 gap-top">
          <div className="card pad-lg"><h3>Food purchasing tips</h3><List items={BUY} icon={Check} cls="good" /></div>
          <div className="card pad-lg"><h3>Food storage tips</h3><List items={STORE} icon={Check} cls="good" /></div>
        </div>

        <h2 className="section-title">Common adulteration examples</h2>
        <div className="card table-wrap">
          <table><thead><tr><th>Food</th><th>Common adulterants</th></tr></thead>
            <tbody>{foods.map((f) => <tr key={f.id}><td>{f.icon} {f.name}</td><td>{f.adulterants.map((a) => a.name).join(", ")}</td></tr>)}</tbody></table>
        </div>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title || ""}>{open && <><span className="chip">{open.category}</span><p className="article-body">{open.content}</p></>}</Modal>
    </>
  );
}
