// src/components/Register.jsx
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("register submit:", form);
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
        />
      </div>

      <button type="submit" className="primary-btn w-100">สมัครสมาชิก</button>
    </form>
  );
}
