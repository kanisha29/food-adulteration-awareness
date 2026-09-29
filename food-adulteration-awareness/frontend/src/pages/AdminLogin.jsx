import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { IMAGES, bg } from "../config/images.js";
import Field from "../components/Field.jsx";

export default function AdminLogin() {
  const { admin, adminLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) return setError("Enter your username and password.");
    setBusy(true);
    try { await adminLogin({ username, password }); navigate(location.state?.from || "/admin", { replace: true }); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="admin-login" style={bg(IMAGES.admin, "rgba(6,24,20,.94)", "rgba(6,24,20,.8)")}>
      <form className="card admin-card" onSubmit={submit} noValidate>
        <ShieldCheck size={40} />
        <h2>Admin console</h2>
        <p className="muted">Authorised staff only.</p>
        {error && <div className="alert">{error}</div>}
        <Field label="Username"><input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        <button className="btn btn-primary block" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <Link to="/" className="auth-alt">Back to website</Link>
      </form>
    </div>
  );
}
