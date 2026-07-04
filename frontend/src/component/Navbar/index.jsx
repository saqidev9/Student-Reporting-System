import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const titles = [
    { path: "/Admin/all-student", title: "Students" },
    { path: "/Admin/program-structure", title: "Program Structure" },
    { path: "/Admin/all-reports", title: "Reports" },
    { path: "/Admin/Attendence", title: "Attendence" },
    { path: "/Admin/tags", title: "Tags" },
    { path: "/Admin/settings", title: "Settings" },
    { path: "/Admin", title: "Admin Dashboard" },
  ];

  const pathname = location.pathname.toLowerCase();

  const pageTitle =
    titles.find((t) => pathname.startsWith(t.path.toLowerCase()))?.title ||
    " Dashboard";

  return (
    <div className="h-16 border-b border-[#e5e7eb] bg-white flex items-center px-6">
      <h1 className="text-[13px] font-semibold">{pageTitle}</h1>
    </div>
  );
}

export default Navbar;
