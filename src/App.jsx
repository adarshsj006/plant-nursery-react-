import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import PlantList from "./components/PlantList";
import ProductView from "./components/ProductView";
import Cart from "./components/Cart";
import Profile from "./components/Profile";

import AdminDashboard from "./components/admin/AdminDashboard";
import PlantManager from "./components/admin/PlantManager";
import ManageUsers from "./components/admin/ManageUsers";

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import NotFound from "./components/NotFound";

import "./styles/style.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //isAuthenticated → user logged in or not
  const [userRole, setUserRole] = useState(""); //userRole → admin or user
  const [cart, setCart] = useState([]); //cart → stores cart items




//   Reads login info from localStorage
// Restores login after refresh
// Restores cart after refresh

// 👉 Without this, user would be logged out on every reload.

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role || "user");
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);




// Second useEffect — save cart automatically,Whenever cart changes → save it.

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

 //Save token and role
//Set login state

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };
//Remove token and role
//Clear cart
//Logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole("");
    setCart([]);
  };

  const isAdmin = userRole === "admin";
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
//If plant exists → increase quantity
//Else → add new item
  const addToCart = (plant) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === plant.id);
      if (existing) {
        return prev.map((x) => (x.id === plant.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...plant, quantity: 1 }];
    });
  };
//Change item quantity
//If quantity < 1 → remove item

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return setCart((prev) => prev.filter((x) => x.id !== id));
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, quantity } : x)));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((x) => x.id !== id));
  const getCartTotal = () => cart.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <Router>
      <Navbar
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        logout={logout}
        cartCount={cartCount}
      />

      <Routes>
        {/* Public */}
        <Route path="/login" element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/plants" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/plants" />} />

        {/* Protected (any logged-in user) */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/plants" element={<PlantList />} />
          <Route path="/product/:id" element={<ProductView addToCart={addToCart} userRole={userRole} />} />

          {/* User-only pages */}
          <Route path="/cart" element={!isAdmin ? (
            <Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} getCartTotal={getCartTotal} />
          ) : (
            <Navigate to="/plants" />
          )} />

          <Route path="/profile" element={!isAdmin ? <Profile /> : <Navigate to="/plants" />} />
        </Route>

        {/* Admin-only */}
        <Route element={<AdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage-plants" element={<PlantManager />} />
          <Route path="/manage-users" element={<ManageUsers />} />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/plants" : "/login"} />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;