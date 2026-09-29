import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import Field from "../components/Field.jsx";

const validate = (f) => {
  const e = {};
  if (f.full_name.trim().length < 2) e.full_name = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = "Enter a valid email address.";
  if (!/^\+?\d{10,14}$/.test(f.phone)) e.phone = "Enter 10-14 digits.";
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "Use 8+ characters with letters and numbers.";
  if (f.password !== f.confirm_password) e.confirm_password = "Passwords do not match.";
  return e;
};

export default function Register() {
  const [f, setF] = useState({ full_name: "", email: "", phone: "", password: "", confirm_password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(f);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await api.register(f);
      toast("Account created. Please sign in.");
      navigate("/login");
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, "error");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Create your account</h2>
      <Field label="Full name" error={errors.full_name}><input value={f.full_name} onChange={set("full_name")} autoComplete="name" /></Field>
      <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
      <Field label="Phone number" error={errors.phone}><input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></Field>
      <Field label="Password" error={errors.password} hint="At least 8 characters, with letters and numbers."><input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" /></Field>
      <Field label="Confirm password" error={errors.confirm_password}><input type="password" value={f.confirm_password} onChange={set("confirm_password")} autoComplete="new-password" /></Field>
      <button className="btn btn-primary block" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
      <p className="auth-alt">Already registered? <Link to="/login">Sign in</Link></p>
    </form>
  );
}
