import React from "react";
import { IoChevronForward } from "react-icons/io5";
import { getAvatarInitials, getAvatarColor } from "../Avatar";

function StudentNoReportRow({ student, onClick }) {
  const initials = getAvatarInitials(student.name);
  const avatarColor = getAvatarColor(student.name);

  return (
    <div
      onClick={() => onClick?.(student)}
      className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{student.name}</p>
          <p className="text-xs text-gray-400">{student.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          {student.groupName}
        </span>
        <IoChevronForward className="text-gray-300" size={16} />
      </div>
    </div>
  );
}

export default React.memo(StudentNoReportRow);
