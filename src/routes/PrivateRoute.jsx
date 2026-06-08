import React from "react";
import { Navigate, Outlet } from "react-router-dom";   /*tools from React Router.  */

const PrivateRoute = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;