import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  stock: "",
  description: "",
};

const PlantManager = () => {
  const token = localStorage.getItem("token");

  const [plants, setPlants] = useState([]); //Store plant list.
  const [formData, setFormData] = useState(emptyForm);  //Store form inputs.
  const [imageFile, setImageFile] = useState(null); //Store selected image.

  const [editingId, setEditingId] = useState(null); //Know if editing a plant.
  const [error, setError] = useState(""); //Show error or success message.
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);  
  const [loadingPlants, setLoadingPlants] = useState(true);//Loading states.

  const imagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]); //Create preview URL when image selected.

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]); //Clean preview memory when changed.

  const loadPlants = async () => {
    setLoadingPlants(true);  //Function to fetch plants.
    try {
      const res = await fetch(`${API_BASE}/plants`); //Call API.
      const data = await res.json();
      setPlants(Array.isArray(data) ? data : []); //Save plants safely.
    } catch (e) {
      console.error(e);
      setPlants([]);
    } finally {
      setLoadingPlants(false);
    }
  };

  useEffect(() => {         //Load plants on page open.
    loadPlants();
  }, []);

  const resetForm = () => {    //Clear form after submit/edit.
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setError("");
    const fileInput = document.getElementById("plant-image-input");
    if (fileInput) fileInput.value = "";
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value })); //Update form when typing.
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null);  //Store selected image.
  };

  const startEdit = (plant) => {
    setError("");    //Fill form with plant data to edit.
    setMsg("");
    setEditingId(plant.id);
    setFormData({
      name: plant.name || "",
      price: plant.price ?? "",
      category: plant.category || "",
      stock: plant.stock ?? "",
      description: plant.description || "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();                         //Check token.If adding → image required.Create FormData.Append all fields,Choose POST (add) or PUT (update),Call API,Reload plantsReset form
    setError("");
    setMsg("");

    if (!token) {
      setError("Please login as admin first.");
      return;
    }

    // Create requires image, update optional
    if (!editingId && !imageFile) {
      setError("Please choose an image file.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("price", formData.price);
      fd.append("category", formData.category);
      fd.append("stock", formData.stock);
      fd.append("description", formData.description);

      if (imageFile) fd.append("image", imageFile);

      const url = editingId ? `${API_BASE}/plants/${editingId}` : `${API_BASE}/plants`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `${method} failed`);

      setMsg(editingId ? "Plant updated successfully." : "Plant added successfully.");
      await loadPlants();
      resetForm();
    } catch (e2) {
      setError(e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deletePlant = async (id) => {
    setError("");
    setMsg("");            //Ask confirm → call DELETE API → remove from list.

    if (!token) {
      setError("Please login as admin first.");
      return;
    }

    if (!confirm("Delete this plant?")) return;

    try {
      const res = await fetch(`${API_BASE}/plants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setPlants((prev) => prev.filter((p) => p.id !== id));
      setMsg("Plant deleted.");
    } catch (e) {
      setError(e.message || "Delete failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Plant Inventory</h1>
          <p style={styles.subtitle}>Create, update, and manage plant listings</p>
        </div>

        <button style={styles.refreshBtn} onClick={loadPlants} disabled={loadingPlants}>
          {loadingPlants ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <div style={styles.cardTop}>
          <h2 style={styles.cardTitle}>{editingId ? "Edit Plant" : "Add New Plant"}</h2>
          {editingId && (
            <button type="button" style={styles.ghostBtn} onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        {error && <div style={styles.alertError}>{error}</div>}
        {msg && <div style={styles.alertSuccess}>{msg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <Field label="Plant Name">
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="e.g., Monstera"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Price">
              <input
                style={styles.input}
                type="number"
                name="price"
                placeholder="e.g., 499"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Category">
              <input
                style={styles.input}
                type="text"
                name="category"
                placeholder="e.g., Indoor"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Stock">
              <input
                style={styles.input}
                type="number"
                name="stock"
                placeholder="e.g., 20"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description (optional)">
                <textarea
                  style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                  name="description"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label={editingId ? "Update Image (optional)" : "Image (required)"}>
                <input
                  id="plant-image-input"
                  style={styles.file}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingId}
                />
              </Field>
            </div>

            {imagePreview && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={styles.previewWrap}>
                  <div style={styles.previewLabel}>New Image Preview</div>
                  <img src={imagePreview} alt="preview" style={styles.previewImg} />
                </div>
              </div>
            )}
          </div>

          <div style={styles.formActions}>
            <button style={styles.primaryBtn} type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Plant" : "Add Plant"}
            </button>
          </div>
        </form>
      </div>

      {/* List/Table */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <div style={styles.cardTop}>
          <h2 style={styles.cardTitle}>Plant List</h2>
          <div style={styles.smallText}>
            Total: <strong>{plants.length}</strong>
          </div>
        </div>

        {loadingPlants ? (
          <div style={styles.smallText}>Loading plants...</div>
        ) : plants.length === 0 ? (
          <div style={styles.smallText}>No plants found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => {
                  const stock = Number(plant.stock || 0);
                  const price = Number(plant.price || 0);

                  return (
                    <tr key={plant.id} style={styles.tr}>
                      <td style={styles.td}>
                        <img
                          src={plant.image || "https://via.placeholder.com/80x60?text=Plant"}
                          alt={plant.name}
                          style={styles.tableImg}
                        />
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 900 }}>{plant.name}</div>
                        <div style={styles.smallMuted}>
                          {plant.description ? plant.description.slice(0, 60) : "No description"}
                          {plant.description && plant.description.length > 60 ? "..." : ""}
                        </div>
                      </td>
                      <td style={styles.td}>{plant.category || "-"}</td>
                      <td style={styles.td}>₹{price.toFixed(2)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.stockPill,
                            background: stock <= 0 ? "#ffebee" : "#e8f5e9",
                            color: stock <= 0 ? "#c62828" : "#2e7d32",
                            borderColor: stock <= 0 ? "#ffcdd2" : "#c8e6c9",
                          }}
                        >
                          {stock <= 0 ? "Out" : stock}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => startEdit(plant)}>
                          Edit
                        </button>
                        <button style={styles.deleteBtn} onClick={() => deletePlant(plant.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <div style={styles.label}>{label}</div>
    {children}
  </div>
);

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
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 28, letterSpacing: 0.2 },
  subtitle: { margin: "6px 0 0", color: "#546e7a", fontWeight: 600 },

  refreshBtn: {
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 900, color: "#1b5e20" },

  alertError: {
    background: "#ffebee",
    border: "1px solid #ffcdd2",
    color: "#b71c1c",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    marginBottom: 10,
  },
  alertSuccess: {
    background: "#e8f5e9",
    border: "1px solid #c8e6c9",
    color: "#1b5e20",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    marginBottom: 10,
  },

  form: { marginTop: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  label: { fontWeight: 800, marginBottom: 6, color: "#2b2b2b" },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontSize: 14,
  },
  file: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px dashed rgba(0,0,0,0.25)",
    background: "#fafafa",
  },

  previewWrap: {
    marginTop: 4,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    padding: 12,
    background: "#fafafa",
  },
  previewLabel: { fontWeight: 900, marginBottom: 8, color: "#2e7d32" },
  previewImg: { width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12 },

  formActions: { marginTop: 12, display: "flex", justifyContent: "flex-end" },
  primaryBtn: {
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  ghostBtn: {
    border: "1px solid rgba(0,0,0,0.14)",
    background: "transparent",
    borderRadius: 12,
    padding: "8px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid rgba(0,0,0,0.10)",
    color: "#263238",
    fontWeight: 900,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tr: { borderBottom: "1px solid rgba(0,0,0,0.06)" },
  td: { padding: 12, verticalAlign: "top" },

  tableImg: {
    width: 86,
    height: 62,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#f5f5f5",
  },

  stockPill: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontWeight: 900,
    fontSize: 13,
  },

  editBtn: {
    border: "1px solid rgba(46,125,50,0.25)",
    background: "#e8f5e9",
    color: "#1b5e20",
    padding: "8px 10px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    marginRight: 8,
  },
  deleteBtn: {
    border: "1px solid rgba(198,40,40,0.20)",
    background: "#ffebee",
    color: "#b71c1c",
    padding: "8px 10px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  smallText: { color: "#607d8b", fontWeight: 700 },
  smallMuted: { marginTop: 4, color: "#78909c", fontWeight: 700, fontSize: 12 },
};

export default PlantManager;















