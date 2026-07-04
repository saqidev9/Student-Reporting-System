// import React from "react";
// import { Navigate, outlet } from "react-router-dom";

// function ProtectedRoute({ children, role }) {
//   const token = localStorage.getItem("token");
//   const userRole = localStorage.getItem("role");

//   // Token nahi → login pe bhejo
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // Role galat → apne sahi route pe bhejo
//   if (role && userRole !== role) {
//     return <Navigate to={`/${userRole}`} replace />;
//   }

//   return children;
// }

// export default ProtectedRoute;
import React from "react";
import { Navigate, Outlet } from "react-router-dom"; // ✅ capital O

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children ? children : <Outlet />; // ✅ this is the key fix
}

export default ProtectedRoute;
