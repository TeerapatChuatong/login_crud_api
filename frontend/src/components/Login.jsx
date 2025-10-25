import { useState } from "react";

export default function Login({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({ account: "", password: "", remember: false });

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: ตรวจสอบกับ API จริง
    onSuccess?.(); // → App.jsx จะ navigate('/crud')
  };

  return (
    <form onSubmit={onSubmit}>
      {/* ช่องกรอกตามเดิมของคุณ */}
      <div className="mb-3">
        <label className="form-label">อีเมลหรือชื่อผู้ใช้</label>
        <input className="form-control" name="account" value={form.account} onChange={onChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">รหัสผ่าน</label>
        <input className="form-control" type="password" name="password" value={form.password} onChange={onChange} required />
      </div>
      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="remember" name="remember" checked={form.remember} onChange={onChange}/>
        <label className="form-check-label" htmlFor="remember">จดจำฉันไว้ในเครื่องนี้</label>
      </div>
      <button type="submit" className="primary-btn w-100">เข้าสู่ระบบ</button>

      <div className="small text-muted mt-2">
        ยังไม่มีบัญชีแอดมิน?{" "}
        <a href="#" onClick={(e)=>{ e.preventDefault(); onSwitch?.(); }}>สมัครสมาชิก</a>
      </div>
    </form>
  );
}
