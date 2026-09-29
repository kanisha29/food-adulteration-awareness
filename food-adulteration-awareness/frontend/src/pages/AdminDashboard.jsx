import { useEffect, useState } from "react";
import { Users, Utensils, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { STATUS, STATUS_COLORS } from "../config/categories.js";
import Counter from "../components/Counter.jsx";
import Loader from "../components/Loader.jsx";
import { BarChart, Donut } from "../components/Charts.jsx";

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const toast = useToast();
  useEffect(() => { api.admin.stats().then(setS).catch((e) => toast(e.message, "error")); /* eslint-disable-next-line */ }, []);
  if (!s) return <Loader />;
  const kpis = [[Users, s.users, "Total users"], [Utensils, s.foods, "Total foods"], [ClipboardList, s.reports, "Total reports"], [Clock, s.by_status.pending, "Pending"], [CheckCircle2, s.by_status.resolved, "Resolved"]];
  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      <div className="kpis">{kpis.map(([I, n, l]) => <div className="card kpi" key={l}><I size={22} /><strong><Counter value={n} /></strong><span>{l}</span></div>)}</div>
      <div className="grid g2">
        <div className="card pad-lg"><h3>Reports by status</h3>
          <Donut parts={Object.keys(STATUS).map((k) => ({ label: STATUS[k], value: s.by_status[k], color: STATUS_COLORS[k] }))} /></div>
        <div className="card pad-lg"><h3>Reports per day (latest 7)</h3>
          <BarChart data={s.daily.map((d) => ({ label: d.day.slice(5), value: d.count }))} color="var(--orange)" /></div>
        <div className="card pad-lg"><h3>Foods by category</h3>
          <BarChart data={s.categories.map((c) => ({ label: c.name.split(" ")[0], value: c.count }))} /></div>
        <div className="card pad-lg"><h3>Recent reports</h3>
          {s.recent.length ? <ul className="recent">{s.recent.map((r) => <li key={r.report_code}><div><b>{r.product}</b><small>{r.full_name} | {r.report_date}</small></div><span className={"badge status-" + r.status}>{STATUS[r.status]}</span></li>)}</ul> : <p className="muted">No reports yet.</p>}</div>
      </div>
    </>
  );
}
