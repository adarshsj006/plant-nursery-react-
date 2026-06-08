import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const Login = ({ login }) => {
  const [formData, setFormData] = useState({   //Saves what user types.
    identifier: "", // email (user) OR admin id (example ADM001)
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, { //Sends login data to server.
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // stores token + role in App (your existing login() does this)
      login(data.token, data.role);  //Saves tokenSaves role (admin or user)

      // redirect admin to admin page, users to plants
      if (data.role === "admin") navigate("/admin");//Redirect based on role
      else navigate("/plants");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back to GreenThumb Nursery</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email / Admin ID</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange} //Updates state when user types in fields.
              required
              placeholder="Email (user) OR Admin ID (example ADM001)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login to Your Account"}
          </button>

          <div className="form-footer">
            <p>
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;