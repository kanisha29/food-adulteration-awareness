const BASE = import.meta.env.VITE_API_URL || "/api";
const KEYS = { user: "fas_user", admin: "fas_admin" };

export class ApiError extends Error {
  constructor(message, status, fields) { super(message); this.status = status; this.fields = fields || {}; }
}

export const session = {
  get(role) {
    try { return JSON.parse(localStorage.getItem(KEYS[role]) || sessionStorage.getItem(KEYS[role]) || "null"); }
    catch { return null; }
  },
  set(role, data, remember = true) {
    this.clear(role);
    (remember ? localStorage : sessionStorage).setItem(KEYS[role], JSON.stringify(data));
  },
  clear(role) { localStorage.removeItem(KEYS[role]); sessionStorage.removeItem(KEYS[role]); },
};

async function request(path, { method = "GET", body, role = "user" } = {}) {
  const headers = {};
  const s = session.get(role);
  if (s?.token) headers.Authorization = `Bearer ${s.token}`;
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  let res;
  try { res = await fetch(BASE + path, { method, headers, body: payload }); }
  catch { throw new ApiError("Cannot reach the server. Make sure the backend is running on port 5000.", 0); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && s) { session.clear(role); window.dispatchEvent(new Event("fas-unauth")); }
    throw new ApiError(data.error || "Something went wrong. Please try again.", res.status, data.fields);
  }
  return data;
}

const enc = encodeURIComponent;
export const api = {
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  forgot: (email) => request("/auth/forgot", { method: "POST", body: { email } }),
  adminLogin: (b) => request("/admin/login", { method: "POST", body: b, role: "admin" }),
  foods: (q = "", category = "") => request(`/foods?q=${enc(q)}&category=${enc(category)}`),
  food: (id) => request(`/foods/${id}`),
  categories: () => request("/categories"),
  articles: () => request("/articles"),
  stats: () => request("/stats"),
  history: () => request("/history"),
  analyze: (fd) => request("/analyze", { method: "POST", body: fd }),
  submitReport: (fd) => request("/reports", { method: "POST", body: fd }),
  myReports: () => request("/reports"),
  admin: {
    stats: () => request("/admin/stats", { role: "admin" }),
    saveFood: (id, fd) => request(id ? `/admin/foods/${id}` : "/admin/foods", { method: id ? "PUT" : "POST", body: fd, role: "admin" }),
    deleteFood: (id) => request(`/admin/foods/${id}`, { method: "DELETE", role: "admin" }),
    reports: (status = "") => request(`/admin/reports?status=${enc(status)}`, { role: "admin" }),
    updateReport: (id, b) => request(`/admin/reports/${id}`, { method: "PUT", body: b, role: "admin" }),
  },
};

export const fileUrl = (name) => (name ? (name.startsWith("http") ? name : `${BASE}/uploads/${name}`) : null);
export const DISCLAIMER = "These checks are for awareness and educational purposes only. They do not confirm adulteration. Laboratory testing may be required for definitive confirmation.";
