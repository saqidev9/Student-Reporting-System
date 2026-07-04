import React from "react";
import Logout from "../../component/elements/Logout";
import AdminSidebar from "../../component/Dashboard/AdminSideBar";
import Navebar from "../../component/Navbar";
import Content from "../../component/DashboardContent";
import { Outlet } from "react-router-dom";
function Admin() {
  return (
    <>
      <div className="flex">
        <AdminSidebar />
        <div
          className="flex-1 bg-gray-100
        ml-64 h-screen"
        >
          <Navebar />
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Admin;
