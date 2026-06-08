import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container" style={{ padding: 20 }}>
      <h2>404 - Page Not Found</h2>
      <Link className="btn" to="/plants">Go to Plants</Link>
    </div>
  );
};

export default NotFound;