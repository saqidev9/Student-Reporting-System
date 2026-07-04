// Content.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import StudentNoReportRow from "./Studentnoreportrow";
import { useDashboardData } from "./Usedashboarddata";
import { useDashboardStats } from "./Usedashboardstates";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineWatchLater } from "react-icons/md";
import { PiUsersThreeBold } from "react-icons/pi";
import { BsCalendar2Check } from "react-icons/bs";
import { HiOutlineRefresh } from "react-icons/hi";

function Content() {
  const navigate = useNavigate();
  const { reports, students, groups, settings, loading, error, refetch } =
    useDashboardData();
  const {
    pendingCount,
    needsRevisionCount,
    activeStudentsCount,
    submissionDeadline,
    studentsWithoutReportToday,
  } = useDashboardStats({ reports, students, groups, settings });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleStudentClick = useCallback(
    (student) => {
      // Placeholder for future student detail page
      navigate(`/Admin/all-student/${student.id}`);
    },
    [navigate],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Dashboard Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs mt-1 text-gray-500">
            Today's report queue, deadlines, and cohort activity.
          </p>
        </div>
        {/* Right: Live dot + Refresh */}
        <div className="flex items-center gap-3">
          {/* Pulsing green dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-xs text-gray-400">Updated just now</span>
          </div>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 px-4 py-2 rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60"
          >
            <HiOutlineRefresh
              className={`text-base ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-4 mt-4">
        <Card
          label="Pending Reviews"
          value={pendingCount}
          hint="Awaiting your feedback"
          icon={FaRegFileAlt}
          iconBgColor="#FEF3E2"
          iconColor="#E07B2A"
        />
        <Card
          label="Needs Revision"
          value={needsRevisionCount}
          hint="Sent back to students"
          icon={MdOutlineWatchLater}
          iconBgColor="#EEEDFE"
          iconColor="#534AB7"
        />
        <Card
          label="Active Students"
          value={activeStudentsCount}
          hint="Across all TDevs"
          icon={PiUsersThreeBold}
          iconBgColor="#E6F1FB"
          iconColor="#185FA5"
        />
        <Card
          label="Submission Deadline"
          value={submissionDeadline}
          icon={BsCalendar2Check}
          iconBgColor="#EAF3DE"
          iconColor="#3B6D11"
          link={{ href: "/Admin/settings", text: "Edit deadline →" }}
        />
      </div>

      {/* Students Without a Report Today */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mt-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Students Without a Report Today
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {studentsWithoutReportToday.length} student
              {studentsWithoutReportToday.length !== 1 ? "s" : ""} have not yet
              submitted today
            </p>
          </div>
          <button
            onClick={() => navigate("/Admin/all-reports")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="mt-3">
          {studentsWithoutReportToday.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              All active students have submitted today. 🎉
            </p>
          ) : (
            studentsWithoutReportToday
              .slice(0, 5)
              .map((student) => (
                <StudentNoReportRow
                  key={student.id}
                  student={student}
                  onClick={handleStudentClick}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Content;
