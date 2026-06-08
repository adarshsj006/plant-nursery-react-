import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [plants, setPlants] = useState([]);//Stores all plants fetched from the server.
  const [usersCount, setUsersCount] = useState(0);//Stores number of users.
  const [loading, setLoading] = useState(true);//Controls loading state while data is being fetched

  const outOfStockCount = useMemo(() => {
    return plants.filter((p) => Number(p.stock || 0) <= 0).length;
  }, [plants]);//Recalculates only when plants change.
//Filters plants where stock is 0 or less.
//Returns count of out-of-stock plants.

  useEffect(() => {                                 //Runs once when component loads (because dependency is [token]).
    const load = async () => {                     //Starts loading state.
      setLoading(true);
      try {
        // Load plants (public endpoint) //Calls backend /plantsSaves plant list into state.
        const plantsRes = await fetch(`${API_BASE}/plants`);
        const plantsData = await plantsRes.json();
        setPlants(Array.isArray(plantsData) ? plantsData : []);

        // Load users (admin endpoint)
        const usersRes = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If token is missing/expired this will fail; just show 0
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersCount(Array.isArray(usersData) ? usersData.length : 0);
        } else {
          setUsersCount(0);
        }
      } catch {
        setPlants([]);
        setUsersCount(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage inventory and users</p>
        </div>

        <button style={styles.primaryBtn} onClick={() => navigate("/manage-plants")}>
          Manage Plants
        </button>
      </div>

      {/* Stats */}
      <div style={styles.grid}>
        <StatCard
          title="Total Plants"
          value={loading ? "—" : plants.length}
          hint="Items in inventory"
          accent="#2e7d32"
        />
        <StatCard
          title="Total Users"
          value={loading ? "—" : usersCount}
          hint="Registered customers"
          accent="#1565c0"
        />
        <StatCard
          title="Out of Stock"
          value={loading ? "—" : outOfStockCount}
          hint="Needs restock"
          accent="#c62828"
        />
      </div>

      {/* Actions */}
      <div style={styles.actionsWrap}>
        <ActionTile
          title="Manage Plants"
          desc="Add, edit, update price & stock, delete plants"
          onClick={() => navigate("/manage-plants")}
        />
        <ActionTile
          title="Manage Users"
          desc="Search users and delete accounts"
          onClick={() => navigate("/manage-users")}
        />
        <ActionTile
          title="Orders (Coming Soon)"
          desc="View and manage orders (future)"
          disabled
          onClick={() => navigate("/orders")}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, hint, accent }) => {
  return (
    <div style={{ ...styles.card, borderLeft: `6px solid ${accent}` }}>
      <div style={styles.cardTop}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value}</div>
      </div>
      <div style={styles.cardHint}>{hint}</div>
    </div>
  );
};

const ActionTile = ({ title, desc, onClick, disabled }) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...styles.tile,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={styles.tileTitle}>{title}</div>
      <div style={styles.tileDesc}>{desc}</div>
      <div style={styles.tileLink}>{disabled ? "Disabled" : "Open →"}</div>
    </button>
  );
};

const styles = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "22px 18px 40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "16px 16px",
    borderRadius: 16,
    background: "linear-gradient(90deg, rgba(46,125,50,0.12), rgba(21,101,192,0.08))",
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: 0.2,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#546e7a",
    fontWeight: 600,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  },
  cardTop: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontWeight: 800,
    color: "#263238",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 900,
    color: "#111",
  },
  cardHint: {
    marginTop: 8,
    color: "#607d8b",
    fontWeight: 600,
    fontSize: 13,
  },

  actionsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },
  tile: {
    textAlign: "left",
    padding: 16,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 900,
    marginBottom: 6,
    color: "#1b5e20",
  },
  tileDesc: {
    color: "#546e7a",
    fontWeight: 600,
    lineHeight: 1.45,
    minHeight: 44,
  },
  tileLink: {
    marginTop: 12,
    fontWeight: 900,
    color: "#2e7d32",
  },
};

export default AdminDashboard;