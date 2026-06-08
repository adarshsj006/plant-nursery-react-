import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If backend returns non-JSON, this avoids crashing:
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server error");
      }

      if (!res.ok) throw new Error(data?.message || "Failed to load profile");

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      setEditing(false);
    } catch (e) {
      setError(e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server error");
      }

      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      setMsg("Profile updated successfully");
      setEditing(false);
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 600, padding: 20 }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600, padding: 20 }}>
      <h2>My Profile</h2>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      {msg && <div style={{ color: "green", marginBottom: 10 }}>{msg}</div>}

      <form onSubmit={onSave}>
        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            disabled={!editing}
          />
        </div>

        <div className="form-group">
          <label>Email (read-only)</label>
          <input value={form.email} disabled />
        </div>

        <div className="form-group">
          <label>Phone (optional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            disabled={!editing}
          />
        </div>

        {!editing ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setError("");
              setMsg("");
              setEditing(true);
            }}
          >
            Update Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadProfile}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;