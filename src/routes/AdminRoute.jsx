import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ isAuthenticated, isAdmin }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/plants" replace />;
  return <Outlet />;
};

export default AdminRoute;