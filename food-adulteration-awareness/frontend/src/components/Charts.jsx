export function BarChart({ data, color = "var(--green-500)" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="muted">No data yet.</p>;
  return (
    <div className="bars">
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <span className="bar-val">{d.value}</span>
          <div className="bar" style={{ height: `${(d.value / max) * 100}%`, background: color }} />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const R = 40, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut" role="img" aria-label="Reports by status">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#e8efe6" strokeWidth="14" />
        {total > 0 && parts.map((p) => {
          const len = (p.value / total) * C;
          const el = <circle key={p.label} cx="50" cy="50" r={R} fill="none" stroke={p.color} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
          offset += len;
          return el;
        })}
        <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f3d2e">{total}</text>
      </svg>
      <ul className="legend">{parts.map((p) => <li key={p.label}><i style={{ background: p.color }} />{p.label}: <b>{p.value}</b></li>)}</ul>
    </div>
  );
}
