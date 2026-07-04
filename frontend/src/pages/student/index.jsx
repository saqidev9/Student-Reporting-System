// pages/student/index.jsx  (replaces your current Student.jsx)
import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../../component/Student Components/StudentSideBar";
import Navbar from "../../component/Navbar";

function Student() {
  return (
    <div className="flex">
      <StudentSidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gray-100">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default Student;
