import { createContext, useContext, useEffect, useState } from "react";
import { api, session } from "../services/api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.get("user")?.profile || null);
  const [admin, setAdmin] = useState(() => session.get("admin")?.profile || null);

  useEffect(() => {
    const sync = () => { setUser(session.get("user")?.profile || null); setAdmin(session.get("admin")?.profile || null); };
    window.addEventListener("fas-unauth", sync);
    return () => window.removeEventListener("fas-unauth", sync);
  }, []);

  const login = async (body, remember) => {
    const r = await api.login(body);
    session.set("user", { token: r.token, profile: r.user }, remember);
    setUser(r.user);
    return r.user;
  };
  const adminLogin = async (body) => {
    const r = await api.adminLogin(body);
    session.set("admin", { token: r.token, profile: r.admin }, false);
    setAdmin(r.admin);
    return r.admin;
  };
  const logout = () => { session.clear("user"); setUser(null); };
  const adminLogout = () => { session.clear("admin"); setAdmin(null); };

  return <AuthCtx.Provider value={{ user, admin, login, adminLogin, logout, adminLogout }}>{children}</AuthCtx.Provider>;
}
