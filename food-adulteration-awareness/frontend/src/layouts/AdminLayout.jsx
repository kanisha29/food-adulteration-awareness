import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLayout() {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const items = [["/admin", "Dashboard", LayoutDashboard, true], ["/admin/foods", "Foods", Utensils], ["/admin/reports", "Reports", ClipboardList]];
  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="brand light"><ShieldCheck size={22} /> Admin</div>
        <nav>
          {items.map(([to, label, I, end]) => <NavLink key={to} to={to} end={end}><I size={18} /> {label}</NavLink>)}
        </nav>
        <div className="admin-user">
          <small>Signed in as {admin?.username}</small>
          <button className="btn btn-ghost btn-sm" onClick={() => { adminLogout(); navigate("/admin/login"); }}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
