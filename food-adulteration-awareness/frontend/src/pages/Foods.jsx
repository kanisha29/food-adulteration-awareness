import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { IMAGES } from "../config/images.js";
import { iconFor } from "../config/categories.js";
import PageHero from "../components/PageHero.jsx";
import FoodCard from "../components/FoodCard.jsx";
import FoodDetail from "../components/FoodDetail.jsx";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";

export default function Foods() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [foods, setFoods] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const toast = useToast();

  useEffect(() => { api.categories().then((r) => setCats(r.categories)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => setQ(text.trim()), 250); return () => clearTimeout(t); }, [text]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.foods(q, category).then((r) => alive && setFoods(r.foods)).catch((e) => toast(e.message, "error")).finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  const setCat = (c) => (c ? setParams({ category: c }) : setParams({}));
  return (
    <>
      <PageHero image={IMAGES.foods} title="Food Information" subtitle="Detailed guides for everyday foods and the adulterants to watch for." />
      <div className="container section">
        <div className="toolbar">
          <div className="searchbar light"><Search size={18} /><input placeholder="Search foods or adulterants" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search foods" /></div>
          <div className="chips">
            <button className={"chip big" + (!category ? " active" : "")} onClick={() => setCat("")}>All</button>
            {cats.map((c) => <button key={c.name} className={"chip big" + (category === c.name ? " active" : "")} onClick={() => setCat(c.name)}>{iconFor(c.name)} {c.name}</button>)}
          </div>
        </div>
        {loading ? <Loader /> : foods.length ? (
          <div className="grid g3">{foods.map((f) => <FoodCard key={f.id} food={f} onClick={setOpen} />)}</div>
        ) : <div className="empty"><h3>No foods found</h3><p>Try a different search or category.</p></div>}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name || ""} wide>{open && <FoodDetail food={open} />}</Modal>
    </>
  );
}
