// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Crud from "./components/Crud.jsx";

const API_AUTH = import.meta.env.VITE_API_AUTH; // ex. https://<ngrok>/crud/api/auth

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthConsole />} />
      <Route
        path="/crud"
        element={
          <RequireAuth>
            <Crud />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ---------- Guard: ต้องล็อกอินก่อนถึงเข้าหน้า /crud ---------- */
function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_AUTH}/me.php`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!ignore) setOk(res.ok && data?.ok);
      } catch {
        if (!ignore) setOk(false);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  if (loading) return <div className="p-4 text-center text-muted">กำลังตรวจสอบสิทธิ์…</div>;
  if (!ok) return <Navigate to="/" replace />;
  return children;
}

/* ---------- หน้า Auth พร้อมปุ่มสลับแท็บ + auto-login ---------- */
function AuthConsole() {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();

  // auto-login: ถ้ามีเซสชันอยู่แล้วให้เด้งไป /crud
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_AUTH}/me.php`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!ignore && res.ok && data?.ok) navigate("/crud", { replace: true });
      } catch {}
    })();
    return () => { ignore = true; };
  }, [navigate]);

  return (
    <div className="app-shell">
      <div className="auth-card shadow-sm w-100" style={{ maxWidth: 560 }}>
        <h1 className="title mb-3">Admin Console</h1>

        <div className="d-flex gap-2 mb-4">
          <button
            type="button"
            className={`tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {tab === "login" ? (
          <Login
            onSwitch={() => setTab("register")}
            onSuccess={() => navigate("/crud")} // ล็อกอินสำเร็จ → ไปหน้า CRUD
          />
        ) : (
          <Register onSwitch={() => setTab("login")} />
        )}
      </div>
    </div>
  );
}
