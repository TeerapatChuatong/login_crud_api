// src/components/Login.jsx
import { useState } from "react";

const API_AUTH = import.meta.env.VITE_API_AUTH; // ex. https://<ngrok>/crud/api/auth

export default function Login({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({ account: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!API_AUTH) {
      setErr("ไม่ได้ตั้งค่า VITE_API_AUTH"); 
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // สำคัญ: ให้ session cookie ติดไปด้วย
        body: JSON.stringify({
          account: form.account.trim(),
          password: form.password,
          remember: !!form.remember,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      onSuccess?.(); // สำเร็จ → App.jsx จะ navigate('/crud')
    } catch (e) {
      setErr(e.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label">อีเมลหรือชื่อผู้ใช้</label>
        <input
          className="form-control"
          name="account"
          value={form.account}
          onChange={onChange}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">รหัสผ่าน</label>
        <input
          className="form-control"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="remember"
          name="remember"
          checked={form.remember}
          onChange={onChange}
          disabled={loading}
        />
        <label className="form-check-label" htmlFor="remember">
          จดจำฉันไว้ในเครื่องนี้
        </label>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <button type="submit" className="primary-btn w-100" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <div className="small text-muted mt-2">
        ยังไม่มีบัญชีแอดมิน?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch?.(); }}>
          สมัครสมาชิก
        </a>
      </div>
    </form>
  );
}
