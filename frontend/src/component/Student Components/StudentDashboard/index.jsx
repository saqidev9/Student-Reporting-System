// component/Student Components/StudentDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useStudentDashboard } from "../Hooks/useStudentDashboard";
import StarRating from "../StarRating";
import {
  FiFileText,
  FiTrendingUp,
  FiCheckSquare,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

// ── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, valueColor = "text-gray-800" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1 min-w-0">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MonthStatBox({
  label,
  value,
  valueColor = "text-gray-800",
  children,
}) {
  return (
    <div className="border border-gray-100 rounded-lg p-4 flex flex-col gap-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      {children ?? <p className={`text-xl font-bold ${valueColor}`}>{value}</p>}
    </div>
  );
}

function AttendancePill({ count, label, bg, text }) {
  return (
    <div className={`${bg} rounded-xl p-4 flex flex-col gap-1 flex-1`}>
      <p className={`text-2xl font-bold ${text}`}>{count}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-green-100 text-green-700",
    "Needs Revision": "bg-orange-100 text-orange-600",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        map[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      • {status}
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

function StudentDashboard() {
  const { data, loading, error } = useStudentDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  const {
    student,
    latestApprovedReport,
    thisWeek,
    thisMonth,
    attendanceThisMonth,
    recentReports,
    latestFeedback,
    submissionDeadline,
  } = data;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {student.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{formatDate()}</p>
      </div>

      {/* Latest Approved Report Banner */}
      {latestApprovedReport && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <FiCheckSquare size={20} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-800">Report approved!</p>
              <StatusBadge status="Approved" />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span>
                Score:{" "}
                <strong>
                  {latestApprovedReport.score}/{latestApprovedReport.maxScore}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                Rating:{" "}
                <StarRating
                  rating={latestApprovedReport.rating}
                  max={latestApprovedReport.maxRating}
                />
              </span>
            </div>
            <div className="border-l-4 border-green-400 pl-3">
              <p className="text-sm text-gray-500 italic">
                {latestApprovedReport.feedback}
              </p>
            </div>
          </div>
          <Link
            to="/student/report-history"
            className="text-sm text-blue-600 hover:underline whitespace-nowrap shrink-0 border border-gray-200 px-3 py-1.5 rounded-lg bg-white"
          >
            View report
          </Link>
        </div>
      )}

      {/* This Week */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            This Week
          </p>
          <p className="text-xs text-gray-400">{thisWeek.dateRange}</p>
        </div>
        <div className="flex gap-4">
          <StatCard
            icon={<FiFileText size={14} />}
            label="Reports submitted"
            value={thisWeek.reportsSubmitted}
            sub={`${thisWeek.onTime} on time · ${thisWeek.late} late`}
          />
          <StatCard
            icon={<FiTrendingUp size={14} />}
            label="Study hours"
            value={thisWeek.studyHours ?? "—"}
            sub="Not tracked yet."
          />
          <StatCard
            icon={<FiCheckSquare size={14} />}
            label="Completion rate"
            value={
              thisWeek.completionRate != null
                ? `${thisWeek.completionRate}%`
                : "—"
            }
            valueColor="text-red-500"
            sub="vs. weekdays in the week"
          />
        </div>

        {/* Week badges */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>
            On time <strong className="text-gray-700">{thisWeek.onTime}</strong>
          </span>
          <span>
            Late <strong className="text-gray-700">{thisWeek.late}</strong>
          </span>
          <span className="text-green-600 font-semibold">
            Approved {thisWeek.approved}
          </span>
        </div>
      </div>

      {/* This Month + Attendance */}
      <div className="grid grid-cols-2 gap-4">
        {/* This Month */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">This month</p>
              <p className="text-xs text-blue-500">{thisMonth.label}</p>
            </div>
            <Link
              to="/student/my-performance"
              className="text-xs text-blue-500 hover:underline"
            >
              View full summary →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MonthStatBox label="Submitted" value={thisMonth.submitted} />
            <MonthStatBox
              label="Completion"
              value={`${thisMonth.completion}%`}
              valueColor="text-red-500"
            />
            <MonthStatBox
              label="Avg Score"
              value={`${thisMonth.avgScore}/${thisMonth.maxScore}`}
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <MonthStatBox label="Avg Rating">
              <StarRating
                rating={thisMonth.avgRating}
                max={thisMonth.maxRating}
                size={16}
              />
            </MonthStatBox>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">
                Attendance this month
              </p>
              <p className="text-xs text-blue-500">
                {attendanceThisMonth.label}
              </p>
            </div>
            <Link
              to="/student/my-attendance"
              className="text-xs text-blue-500 hover:underline"
            >
              View log →
            </Link>
          </div>
          <div className="flex gap-3">
            <AttendancePill
              count={attendanceThisMonth.present}
              label="Present"
              bg="bg-green-50"
              text="text-green-600"
            />
            <AttendancePill
              count={attendanceThisMonth.late}
              label="Late"
              bg="bg-yellow-50"
              text="text-yellow-600"
            />
            <AttendancePill
              count={attendanceThisMonth.absent}
              label="Absent"
              bg="bg-red-50"
              text="text-red-500"
            />
          </div>
        </div>
      </div>

      {/* Recent Reports + Latest Feedback */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-800">Recent reports</p>
            <Link
              to="/student/report-history"
              className="text-xs text-blue-500 hover:underline"
            >
              View all reports →
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-4">Your last 5 submissions.</p>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">
                      {report.date}
                    </span>
                    {report.isLate && (
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        LATE
                      </span>
                    )}
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-gray-400">{report.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StarRating
                    rating={report.rating}
                    max={report.maxRating}
                    size={12}
                  />
                  <span className="text-xs text-gray-500">
                    {report.score}/{report.maxScore}
                  </span>
                  <FiChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Feedback */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="font-semibold text-gray-800 mb-1">Latest feedback</p>
          <p className="text-xs text-gray-400 mb-1">
            Most recent admin comment.
          </p>
          <p className="text-xs text-blue-500 mb-4">
            From {latestFeedback.date}
          </p>
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="text-sm text-gray-600 italic">
              {latestFeedback.comment}
            </p>
          </div>
        </div>
      </div>

      {/* Deadline Footer */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-5 py-3">
        <FiCalendar size={14} className="text-gray-400" />
        <span>
          Daily submission deadline:{" "}
          <strong className="text-gray-800">{submissionDeadline}</strong>.
          Reports submitted after this time are marked as{" "}
          <span className="text-orange-500 font-medium">late</span>.
        </span>
      </div>
    </div>
  );
}

export default StudentDashboard;
