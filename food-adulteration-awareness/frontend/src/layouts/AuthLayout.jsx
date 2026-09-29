import { Outlet, Link, useLocation } from "react-router-dom";
import { Leaf } from "lucide-react";
import { IMAGES, bg } from "../config/images.js";

export default function AuthLayout() {
  const isLogin = useLocation().pathname === "/login";
  return (
    <div className="auth" style={bg(isLogin ? IMAGES.login : IMAGES.register, "rgba(8,40,28,.9)", "rgba(8,40,28,.5)")}>
      <div className="auth-side">
        <Link to="/" className="brand light"><Leaf size={24} /> FoodSafe</Link>
        <h1>{isLogin ? "Welcome back" : "Join the food safety community"}</h1>
        <p>Search foods, learn what to watch for, and report anything suspicious.</p>
      </div>
      <div className="auth-card glass"><Outlet /></div>
    </div>
  );
}
