import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Crud from "./components/Crud.jsx"; // ← แก้ path ให้ตรงกับที่ไฟล์อยู่

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthConsole />} />
      <Route path="/crud" element={<Crud />} />
    </Routes>
  );
}

function AuthConsole() {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();

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
            onSuccess={() => navigate("/crud")} // กดเข้าสู่ระบบ → ไปหน้า CRUD
          />
        ) : (
          <Register onSwitch={() => setTab("login")} />
        )}
      </div>
    </div>
  );
}
