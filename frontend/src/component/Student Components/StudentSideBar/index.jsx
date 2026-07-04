// component/Student Components/StudentSidebar.jsx
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt } from "react-icons/fa";
import { MdOutlineUploadFile, MdHistory } from "react-icons/md";
import { IoTrendingUpOutline } from "react-icons/io5";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { useStudentSidebarStats } from "../Hooks/useStudentSidebarStats";
import Logout from "../../elements/Logout"; // ✅ FIXED: correct path
import logo from "../../../assets/logo.svg";

// ✅ FIXED: moved to a function so icons aren't stale module-level JSX
function getNavSections() {
  return [
    {
      label: "OVERVIEW",
      links: [
        {
          to: "/student",
          end: true,
          icon: <FaTachometerAlt size={15} />,
          label: "My Dashboard",
        },
      ],
    },
    {
      label: "REPORTS",
      links: [
        {
          to: "/student/submit-report",
          icon: <MdOutlineUploadFile size={16} />,
          label: "Submit Report",
          badge: "pending",
        },
        {
          to: "/student/report-history",
          icon: <MdHistory size={16} />,
          label: "Report History",
        },
      ],
    },
    {
      label: "MY PROGRESS",
      links: [
        {
          to: "/student/my-performance",
          icon: <IoTrendingUpOutline size={16} />,
          label: "My Performance",
        },
        {
          to: "/student/my-attendance",
          icon: <MdOutlineCalendarMonth size={16} />,
          label: "My Attendance",
        },
      ],
    },
  ];
}

function StudentSidebar() {
  const navSections = useMemo(() => getNavSections(), []);

  // ✅ FIXED: read real user from localStorage instead of hardcoding
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const displayName = user.name || "Student";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-[#1e2d4f] text-white h-screen fixed left-0 top-0 bottom-0 w-64 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
        <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
        <div>
          <h2 className="text-base font-semibold leading-tight">TensaiDevs</h2>
          <p className="text-[11px] text-[#a9a9a9] font-light">
            Student portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-4 px-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold tracking-widest text-[#a8b0b9] px-2 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-[#c5cdd8] hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className=" px-3 py-3">
        <Logout />
      </div>
    </div>
  );
}

export default StudentSidebar;
