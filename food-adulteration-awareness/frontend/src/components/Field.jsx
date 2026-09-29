export default function Field({ label, error, hint, children }) {
  return (
    <label className={"field" + (error ? " has-error" : "")}>
      <span>{label}</span>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && <small className="err">{error}</small>}
    </label>
  );
}
