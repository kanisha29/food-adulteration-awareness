import { Routes, Route, Link } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Checker from "./pages/Checker.jsx";
import Analyze from "./pages/Analyze.jsx";
import Foods from "./pages/Foods.jsx";
import Awareness from "./pages/Awareness.jsx";
import Report from "./pages/Report.jsx";
import MyReports from "./pages/MyReports.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminFoods from "./pages/AdminFoods.jsx";
import AdminReports from "./pages/AdminReports.jsx";

const NotFound = () => (
  <div className="container empty" style={{ padding: "6rem 1rem" }}>
    <h1>Page not found</h1>
    <p>The page you are looking for does not exist.</p>
    <Link className="btn btn-primary" to="/">Back to home</Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="foods" element={<Foods />} />
        <Route path="checker" element={<Checker />} />
        <Route path="awareness" element={<Awareness />} />
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="report" element={<Report />} />
          <Route path="my-reports" element={<MyReports />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="foods" element={<AdminFoods />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  );
}
