// src/components/Crud.jsx
import React from "react";

const APPBAR = { background: "#3f51b5", color: "#fff", height: 56 };

// ✅ ใช้ BASE เป็น "โฟลเดอร์" ไม่ใช่ไฟล์เดียว (ตั้งใน .env)
const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost/crud/api/users";

/* ============ helpers ============ */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Accept: "application/json" },
    credentials: "include", // ⬅️ สำคัญเมื่อใช้ session/cookie ข้ามโดเมน (ngrok)
  });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return safeJson(res);
}

async function apiSend(path, method, body) {
  const res = await fetch(`${API_BASE}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include", // ⬅️
  });
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
  return safeJson(res);
}

// ลบ: พยายาม DELETE ถ้าไม่รองรับค่อย fallback เป็น POST + _method
async function apiDeleteWithFallback(id) {
  try {
    const res = await fetch(`${API_BASE}/delete.php?id=${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include", // ⬅️
    });
    if (!res.ok) throw new Error(`DELETE ${id} ${res.status}`);
    return safeJson(res);
  } catch {
    // Fallback
    return apiSend(`delete.php?id=${id}`, "POST", { _method: "DELETE" });
  }
}

/* ============ component ============ */
export default function Crud() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState(null);

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet("read.php"); // ← GET …/read.php
      const list = Array.isArray(data) ? data : data.data || [];
      setRows(list);
    } catch (err) {
      console.error(err);
      setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditing({
      id: undefined,
      avatar: "https://i.pravatar.cc/40?img=1",
      fname: "",
      lname: "",
      username: "",
      _isCreate: true,
    });
  };
  const openEdit = (row) => setEditing({ ...row, _isCreate: false });

  const onSave = async () => {
    if (
      !editing.fname?.trim() ||
      !editing.lname?.trim() ||
      !editing.username?.trim()
    ) {
      alert("กรอกข้อมูลให้ครบก่อนบันทึก");
      return;
    }
    try {
      setError(null);
      if (editing._isCreate) {
        const payload = {
          fname: editing.fname,
          lname: editing.lname,
          username: editing.username,
          avatar: editing.avatar,
        };
        await apiSend("create.php", "POST", payload); // ← POST …/create.php
      } else {
        const payload = {
          id: editing.id,
          fname: editing.fname,
          lname: editing.lname,
          username: editing.username,
          avatar: editing.avatar,
        };
        try {
          await apiSend("update.php", "PATCH", payload); // ← PATCH …/update.php
        } catch {
          await apiSend("update.php", "POST", {
            ...payload,
            _method: "PATCH",
          }); // fallback สำหรับ PHP ที่ไม่รับ PATCH
        }
      }
      setEditing(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("บันทึกไม่สำเร็จ");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("ต้องการลบผู้ใช้นี้หรือไม่?")) return;
    try {
      setError(null);
      await apiDeleteWithFallback(id); // ← DELETE หรือ POST + _method
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("ลบไม่สำเร็จ");
    }
  };

  const filteredRows = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.fname, r.lname, r.username].some((v) =>
        String(v || "").toLowerCase().includes(s)
      )
    );
  }, [q, rows]);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* AppBar */}
      <div
        style={{
          ...APPBAR,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: "0 2px 6px rgba(0,0,0,.15)",
        }}
      >
        <button
          aria-label="menu"
          style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            border: "none",
            background: "transparent",
            color: "#fff",
            fontSize: 22,
            marginRight: 12,
          }}
        >
          ☰
        </button>
        <div style={{ fontWeight: 700, letterSpacing: 1 }}>CRUD APP</div>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 1080, margin: "20px auto" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,.06)",
          }}
        >
          {/* Header + Search + Create */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
              padding: 16,
              borderBottom: "1px solid #eee",
            }}
          >
            <h4 className="m-0">Users</h4>
            <button
              onClick={openCreate}
              style={{
                background: "#3f51b5",
                color: "#fff",
                border: "1px solid #3949ab",
                borderRadius: 6,
                padding: "8px 14px",
                fontWeight: 700,
              }}
            >
              CREATE
            </button>
            <div style={{ gridColumn: "1 / -1" }}>
              <input
                className="form-control"
                placeholder="Search by first name, last name, or email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* States */}
          {error && <div className="alert alert-danger m-3">{error}</div>}
          {loading ? (
            <div className="p-4 text-center text-muted">กำลังโหลด...</div>
          ) : (
            <div className="table-responsive" style={{ padding: 8 }}>
              <table className="table align-middle m-0">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>avatar</th>
                    <th>fname</th>
                    <th>lname</th>
                    <th>username</th>
                    <th style={{ width: 160 }}>action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>
                        <img
                          src={r.avatar}
                          alt=""
                          width={40}
                          height={40}
                          style={{ borderRadius: 999, objectFit: "cover" }}
                        />
                      </td>
                      <td>{r.fname}</td>
                      <td>{r.lname}</td>
                      <td
                        style={{
                          maxWidth: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.username}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEdit(r)}
                          >
                            EDIT
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDelete(r.id)}
                          >
                            DEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 1000,
          }}
          onClick={() => setEditing(null)}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 520,
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{editing._isCreate ? "Create User" : "Edit User"}</strong>
              <button
                onClick={() => setEditing(null)}
                style={{ border: 0, background: "transparent", fontSize: 22, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div className="mb-3">
                <label className="form-label">Avatar URL</label>
                <input
                  className="form-control"
                  value={editing.avatar}
                  onChange={(e) => setEditing((s) => ({ ...s, avatar: e.target.value }))}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First name</label>
                  <input
                    className="form-control"
                    value={editing.fname}
                    onChange={(e) => setEditing((s) => ({ ...s, fname: e.target.value }))}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-control"
                    value={editing.lname}
                    onChange={(e) => setEditing((s) => ({ ...s, lname: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Username (email)</label>
                <input
                  className="form-control"
                  type="email"
                  value={editing.username}
                  onChange={(e) => setEditing((s) => ({ ...s, username: e.target.value }))}
                />
              </div>
            </div>
            <div
              style={{
                padding: 16,
                borderTop: "1px solid #eee",
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button className="btn btn-light" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
