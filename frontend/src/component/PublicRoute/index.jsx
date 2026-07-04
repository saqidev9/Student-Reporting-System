import React from "react";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    return <Navigate to={role === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
}

export default PublicRoute;
