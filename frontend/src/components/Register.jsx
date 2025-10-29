// src/components/Register.jsx
import { useState } from "react";

const API_AUTH = import.meta.env.VITE_API_AUTH; // ex. https://<ngrok>/crud/api/auth

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!API_AUTH) {
      setErr("ไม่ได้ตั้งค่า VITE_API_AUTH");
      return;
    }
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setErr("กรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // เผื่อ backend สร้างเซสชันทันทีหลังสมัคร
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "สมัครสมาชิกไม่สำเร็จ");
      }

      setOkMsg("สมัครสำเร็จ! ลองเข้าสู่ระบบได้เลย");
      setForm({ username: "", email: "", password: "" });
    } catch (e) {
      setErr(e.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label">ชื่อผู้ใช้</label>
        <input
          className="form-control"
          name="username"
          placeholder="เช่น admin"
          value={form.username}
          onChange={onChange}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">อีเมล</label>
        <input
          className="form-control"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
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
          placeholder="••••••••"
          value={form.password}
          onChange={onChange}
          required
          disabled={loading}
        />
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}
      {okMsg && <div className="alert alert-success py-2">{okMsg}</div>}

      <button type="submit" className="primary-btn w-100" disabled={loading}>
        {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
