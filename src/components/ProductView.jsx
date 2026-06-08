import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const ProductView = ({ addToCart, userRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Works even if userRole prop not passed
  const role = userRole || localStorage.getItem("role");
  const isAdmin = role === "admin";

  const [plant, setPlant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlant = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/plants/${id}`);
        const text = await res.text();
        const data = JSON.parse(text);

        if (!res.ok) throw new Error(data?.message || "Failed to load plant");

        setPlant(data);
        setQuantity(1);
      } catch (e) {
        setError(e.message || "Failed to load plant");
      } finally {
        setLoading(false);
      }
    };

    loadPlant();
  }, [id]);

  const handleAddToCart = () => {
    if (!plant) return;

    const maxQty = Math.max(1, Number(plant.stock || 0));
    const q = Math.min(Math.max(1, quantity), maxQty);

    for (let i = 0; i < q; i++) addToCart(plant);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) return <div className="container">Loading...</div>;

  if (error) {
    return (
      <div className="container" style={{ padding: 20 }}>
        <h2>Unable to load product</h2>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate("/plants")}>
          Back to Plants
        </button>
      </div>
    );
  }

  if (!plant) return null;

  const price = Number(plant.price || 0);
  const stock = Number(plant.stock || 0);
  const inStock = stock > 0;

  return (
    <div className="product-container">
      <div className="product-card">
        <div>
          <img
            src={plant.image || "https://via.placeholder.com/700x500?text=Plant"}
            alt={plant.name}
            className="product-image"
          />
        </div>

        <div className="product-details">
          <h1>{plant.name}</h1>
          <div className="product-price">₹{price.toFixed(2)}</div>

          <div style={{ margin: "1rem 0", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "6px 12px",
                background: inStock ? "#e8f5e9" : "#ffebee",
                color: inStock ? "#2e7d32" : "#c62828",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              {inStock ? `In Stock: ${stock}` : "Out of Stock"}
            </span>

            <span
              style={{
                padding: "6px 12px",
                background: "#f5f5f5",
                color: "#555",
                borderRadius: "6px",
              }}
            >
              {plant.category || "Uncategorized"}
            </span>
          </div>

          <p className="product-description">{plant.description || ""}</p>

          {/* ✅ USER ONLY SECTION */}
          {!isAdmin ? (
            <div
              style={{
                background: "#f0f7f0",
                padding: "1.5rem",
                borderRadius: "10px",
                margin: "1.5rem 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <strong>Quantity:</strong>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!inStock}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))}
                    disabled={!inStock}
                  >
                    +
                  </button>
                </div>
                <span style={{ color: "#666" }}>Max {stock} per order</span>
              </div>

              <button className="btn" onClick={handleAddToCart} disabled={!inStock}>
                Add to Cart
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/cart")}
                style={{ marginTop: 12 }}
              >
                View Cart
              </button>

              {addedToCart && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "10px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  ✓ Added to cart!
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #ffe0b2",
                padding: 12,
                borderRadius: 10,
                margin: "1.5rem 0",
                fontWeight: 800,
                color: "#6d4c41",
              }}
            >
              Admin view: Cart actions are disabled.
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <strong>Product ID:</strong> {plant.id}
          </div>

          <button className="btn" onClick={() => navigate("/plants")} style={{ marginTop: 16 }}>
            Back to Plants
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductView;