import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Field from "../components/Field.jsx";
import Modal from "../components/Modal.jsx";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [fEmail, setFEmail] = useState("");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await login({ identifier, password }, remember);
      toast("Signed in successfully.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const sendReset = async (e) => {
    e.preventDefault();
    try { const r = await api.forgot(fEmail); toast(r.message, "info"); setForgot(false); }
    catch (err) { toast(err.message, "error"); }
  };

  return (
    <>
      <form onSubmit={submit} noValidate>
        <h2>Sign in</h2>
        {error && <div className="alert">{error}</div>}
        <Field label="Email or phone"><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        <div className="row-between">
          <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          <button type="button" className="link-btn" onClick={() => setForgot(true)}>Forgot password?</button>
        </div>
        <button className="btn btn-primary block" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <p className="auth-alt">New here? <Link to="/register">Create an account</Link></p>
      </form>
      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset your password">
        <form onSubmit={sendReset}>
          <Field label="Email"><input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} /></Field>
          <button className="btn btn-primary block">Send reset link</button>
        </form>
      </Modal>
    </>
  );
}
