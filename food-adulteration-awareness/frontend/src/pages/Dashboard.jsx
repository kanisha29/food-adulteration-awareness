import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ScanSearch, Flag, ClipboardList, Clock } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { IMAGES, bg } from "../config/images.js";
import { iconFor, TIPS } from "../config/categories.js";
import Loader from "../components/Loader.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState([]);
  const [history, setHistory] = useState([]);
  const [articles, setArticles] = useState(null);
  useEffect(() => {
    api.categories().then((r) => setCats(r.categories)).catch(() => {});
    api.history().then((r) => setHistory(r.history)).catch(() => {});
    api.articles().then((r) => setArticles(r.articles.slice(0, 3))).catch(() => setArticles([]));
  }, []);
  const quick = [
    ["/checker", ScanSearch, "Adulteration Checker", "Look up any food"],
    ["/analyze", ScanSearch, "AI Image Analysis", "Upload a food photo"],
    ["/report", Flag, "Report a product", "Flag something suspicious"],
    ["/my-reports", ClipboardList, "My reports", "Track your submissions"],
  ];
  return (
    <>
      <section className="page-hero" style={bg(IMAGES.dashboard)}>
        <div className="container">
          <h1>Welcome, {user.full_name.split(" ")[0]}</h1>
          <p>What would you like to check today?</p>
          <form className="searchbar" onSubmit={(e) => { e.preventDefault(); navigate(`/checker?q=${encodeURIComponent(q)}`); }}>
            <Search size={18} /><input placeholder="Search milk, honey, turmeric..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-orange btn-sm">Search</button>
          </form>
        </div>
      </section>
      <div className="container section">
        <div className="grid g4">
          {quick.map(([to, I, t, d]) => <Link key={to} to={to} className="card quick"><I size={26} /><h3>{t}</h3><small>{d}</small></Link>)}
        </div>
        <div className="split-2">
          <div>
            <h2 className="section-title">Browse categories</h2>
            <div className="chips">{cats.map((c) => <Link key={c.name} className="chip big" to={`/foods?category=${encodeURIComponent(c.name)}`}>{iconFor(c.name)} {c.name}</Link>)}</div>
          </div>
          <div>
            <h2 className="section-title">Recent searches</h2>
            {history.length ? (
              <ul className="history">{history.map((h) => <li key={h.query}><Link to={`/checker?q=${encodeURIComponent(h.query)}`}><Clock size={15} /> {h.icon} {h.query}</Link></li>)}</ul>
            ) : <p className="muted">No searches yet. Try the checker.</p>}
          </div>
        </div>
        <h2 className="section-title">Awareness articles</h2>
        {articles === null ? <Loader /> : (
          <div className="grid g3">{articles.map((a) => <Link to="/awareness" key={a.id} className="card article"><span className="art-icon">{a.icon}</span><h3>{a.title}</h3><p>{a.summary}</p></Link>)}</div>
        )}
        <h2 className="section-title">Safety tips</h2>
        <div className="grid g4">{TIPS.map(([t, d]) => <div className="card tip-card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div>
    </>
  );
}
