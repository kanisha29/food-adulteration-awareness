import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScanSearch, BookOpen, Users, Utensils, ClipboardList, FileText } from "lucide-react";
import { api } from "../services/api.js";
import { IMAGES, bg } from "../config/images.js";
import { iconFor, TIPS } from "../config/categories.js";
import Counter from "../components/Counter.jsx";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.categories().then((r) => setCats(r.categories)).catch(() => {});
  }, []);
  const cards = stats ? [
    [Utensils, stats.foods, "Foods covered"], [FileText, stats.articles, "Awareness articles"],
    [Users, stats.users, "Registered users"], [ClipboardList, stats.reports, "Reports filed"],
  ] : [];
  return (
    <>
      <section className="hero" style={bg(IMAGES.home, "rgba(8,40,28,.92)", "rgba(8,40,28,.45)")}>
        <div className="container hero-in">
          <h1>Food Adulteration Awareness System</h1>
          <p>Know what is in your food. Look up common adulterants, understand the health risks, learn simple awareness checks and report anything suspicious.</p>
          <div className="hero-actions">
            <Link to="/checker" className="btn btn-orange"><ScanSearch size={18} /> Check Food</Link>
            <Link to="/awareness" className="btn btn-glass"><BookOpen size={18} /> Learn More</Link>
          </div>
        </div>
      </section>

      {cards.length > 0 && (
        <section className="container stats-strip">
          {cards.map(([I, n, label]) => (
            <div className="card stat-card" key={label}><I size={22} /><strong><Counter value={n} /></strong><span>{label}</span></div>
          ))}
        </section>
      )}

      <section className="container section">
        <h2 className="section-title">Popular food categories</h2>
        <div className="grid g4">
          {cats.map((c) => (
            <Link key={c.name} to={`/foods?category=${encodeURIComponent(c.name)}`} className="card cat-card">
              <span className="cat-icon">{iconFor(c.name)}</span><h3>{c.name}</h3><small>{c.count} foods</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="container">
          <h2 className="section-title">Food safety tips</h2>
          <div className="grid g4">
            {TIPS.map(([t, d]) => <div className="card tip-card" key={t}><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="container section cta">
        <h2>Suspect something in your groceries?</h2>
        <p>Create a free account to report a product and track what happens next.</p>
        <Link to="/report" className="btn btn-primary">Report a product</Link>
      </section>
    </>
  );
}
