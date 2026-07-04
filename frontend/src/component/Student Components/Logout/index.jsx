import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { useCurrentUser } from "./usecurruntuser";

// Generates consistent initials from a name, e.g. "Akira Tanaka" -> "AT"
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Logout() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
      {/* User profile block */}
      <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
        <div className="w-9 h-9 rounded-full bg-[#5b4fd8] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {loading ? "" : getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {loading ? "Loading..." : user?.name || "—"}
          </p>
          <p className="text-xs text-[#a9a9a9] capitalize truncate">
            {loading ? "" : user?.role || ""}
          </p>
        </div>
      </div>

      {/* Sign out button */}
      <button
        onClick={handleLogOut}
        className="w-full flex items-center gap-2 text-sm font-medium text-[#cbd5e1] bg-[#ffffff0d] hover:bg-[#ffffff1a] hover:text-white px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        <IoLogOutOutline size={16} />
        <span>Sign out</span>
      </button>
    </div>
  );
}

export default Logout;
