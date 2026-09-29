import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [["/", "Home"], ["/foods", "Foods"], ["/checker", "Checker"], ["/awareness", "Awareness"],
    ...(user ? [["/dashboard", "Dashboard"], ["/analyze", "AI Analysis"], ["/report", "Report"], ["/my-reports", "My Reports"]] : [])];
  return (
    <header className="nav">
      <div className="container nav-in">
        <Link to="/" className="brand"><Leaf size={22} /> FoodSafe</Link>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={"nav-links" + (open ? " open" : "")} onClick={() => setOpen(false)}>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}><LogOut size={16} /> Sign out</button>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" to="/login">Sign in</Link>
              <Link className="btn btn-orange btn-sm" to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
