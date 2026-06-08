import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

const ManageUsers = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]); //list of users from server
  const [search, setSearch] = useState("");//text typed in search box
  const [error, setError] = useState("");//error message
  const [loading, setLoading] = useState(true);//show loading screen

  const loadUsers = async () => {                    //Run code when page loads.
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },       //Get users from backend with token.
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load users");

      setUsers(data);
    } catch (e) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();  //Fast searching without re-running filter every time.
    if (!q) return users;

    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, search]);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },         //: Get users from backend with token.
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 20 }}>
        Loading users...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 20 }}>
      <h2>Manage Users</h2>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      {/* Search box */}
      <div style={{ maxWidth: 520, margin: "12px 0 18px" }}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #4caf50",
            borderRadius: 12,
            outline: "none",
            fontSize: "1rem",
          }}
        />
        <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
          Showing <strong>{filteredUsers.length}</strong> of{" "}
          <strong>{users.length}</strong> users
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                  Name
                </th>
                <th style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                  Email
                </th>
                <th style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                  Phone
                </th>
                <th style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {u.name}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    {u.phone || "-"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;