import React from "react";
import { NavLink } from "react-router-dom";
import { FaRegFile, FaTachometerAlt } from "react-icons/fa";
import logo from "../../../assets/logo.svg";
import { FaUser } from "react-icons/fa6";
import { FiLayers } from "react-icons/fi";
import { GoTag } from "react-icons/go";
import { CiSettings } from "react-icons/ci";
import "../AdminSideBar/AdminSidebar.style.css";
import Logout from "../../elements/Logout";
import { useSidebarStats } from "../../AllReports/hooks/useSidebarStats";

function AdminSidebar() {
  const { pendingCount, studentCount } = useSidebarStats();
  return (
    <div className="bg-[#1e2d4f] text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
      <div id="sidebar_brand" className="bg-[#1e2d4f] flex items-center  h-12">
        <div>
          <img src={logo} alt="logo" className="w-16 h-16 object-contain" />
        </div>
        <div>
          <h2 className="text-2xl  text-center">Tensai Devs</h2>
          <p className="text-xs font-light text-[#a9a9a9]">Admin workspace</p>
        </div>
      </div>

      <div>
        <NavLink
          id="Navlink"
          to="/Admin"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <p className="text-xs px-4 text-[#a8b0b9]">Students</p>
        <NavLink
          id="Navlink"
          to="/Admin/all-student"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <FaUser />
          <div className="flex gap-23 text-sm">
            <span>All Students</span>
            <span className=" text-sky-300 rounded ">{studentCount}</span>
          </div>
        </NavLink>
        <NavLink
          id="Navlink"
          to="/Admin/program-structure"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <FiLayers />
          <span>Program Structure</span>
        </NavLink>
        <p className="text-xs px-4 text-[#a8b0b9]">Repotrs</p>
        <NavLink
          id="Navlink"
          to="/admin/all-reports"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <FaRegFile />
          <div className="flex  gap-23 text-sm">
            <span>All Reports</span>
            <span className="text-sky-300 rounded px-0.5">{pendingCount}</span>
          </div>
        </NavLink>
        <p className="text-xs px-4 text-[#a8b0b9]">Trackinng</p>
        <NavLink
          id="Navlink"
          to="/Admin/Attendence"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <CiSettings />
          <span>Attendence</span>
        </NavLink>
        <p className="text-xs px-4 text-[#a8b0b9]">System</p>
        <NavLink
          id="Navlink"
          to="/Admin/tags"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <GoTag />
          <span>Tags</span>
        </NavLink>
        <NavLink
          id="Navlink"
          to="/Admin/settings"
          className={({ isActive }) =>
            `${isActive ? "bg-[#ffffff1a]" : ""} flex items-center space-x-4  py-2.5 px-4 rounded text-sm`
          }
        >
          <CiSettings />
          <span>Settings</span>
        </NavLink>
      </div>
      <Logout id="logout" />
    </div>
  );
}

export default AdminSidebar;
