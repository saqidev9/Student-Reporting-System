// component/Student Components/ReportHistory.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { IoAlertCircleOutline } from "react-icons/io5";
import StarRating from "../StarRating";

// ── mock data ─────────────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  {
    id: 1,
    date: "Jun 23, 2026",
    submittedAt: "09:51 PM",
    timeAgo: "just now",
    body: "Spent the session working through JWT-based authentication. Implemented login, token refresh, and protected routes on a small Express + React app. Read the section on httpOnly cookies vs localStorage.",
    status: "Approved",
    isLate: false,
    rating: 2.5,
    score: 4,
    maxScore: 5,
    difficulty: "Low",
    feedback: null,
  },
  {
    id: 2,
    date: "Jun 16, 2026",
    submittedAt: "01:57 AM",
    timeAgo: "6d ago",
    body: "Built a reusable Button and Modal component with proper a11y. Read the WAI-ARIA modal pattern and added focus trapping.",
    status: "Needs Revision",
    isLate: true,
    rating: 5,
    score: 5,
    maxScore: 5,
    difficulty: "Good",
    feedback:
      "Good direction overall. Please expand the 'challenges' section with what you tried before resolving the issue.",
  },
];

const STATUS_OPTIONS = [
  { value: "All statuses", label: "All statuses" },
  { value: "Approved", label: "Approved" },
  { value: "Needs Revision", label: "Needs Revision" },
  { value: "Pending", label: "Pending" },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700 border border-green-200",
  "Needs Revision": "bg-orange-100 text-orange-600 border border-orange-200",
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const DIFFICULTY_STYLES = {
  Low: "bg-pink-100 text-pink-600",
  Medium: "bg-yellow-100 text-yellow-700",
  Good: "bg-blue-100 text-blue-600",
  High: "bg-purple-100 text-purple-700",
};

function parseDate(dateStr) {
  return new Date(dateStr);
}

// ── sub-components ────────────────────────────────────────────────────────────
function ReportCard({ report }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Card header row */}
      <div className="px-6 pt-5 pb-0 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-[15px]">
            {report.date}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Submitted {report.submittedAt} · {report.timeAgo}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {report.isLate && (
            <span className="text-[11px] font-bold border border-red-400 text-red-500 px-2 py-0.5 rounded">
              LATE
            </span>
          )}
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              STATUS_STYLES[report.status] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            • {report.status}
          </span>
        </div>
      </div>

      {/* Body text */}
      <div className="px-6 py-4">
        <p className="text-sm text-gray-600 leading-relaxed">{report.body}</p>
      </div>

      {/* Rating + score + difficulty */}
      <div className="px-6 pb-4 flex items-center gap-3">
        <StarRating rating={report.rating} max={5} size={16} />
        <span className="text-sm text-gray-500">
          {report.score}/{report.maxScore}
        </span>
        {report.difficulty && (
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              DIFFICULTY_STYLES[report.difficulty] ??
              "bg-gray-100 text-gray-500"
            }`}
          >
            {report.difficulty}
          </span>
        )}
      </div>

      {/* Feedback panel — only shown when status is Needs Revision */}
      {report.status === "Needs Revision" && report.feedback && (
        <div className="mx-6 mb-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <IoAlertCircleOutline
              size={18}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Needs revision
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{report.feedback}</p>
            </div>
          </div>
          <Link
            to="/student/submit-report"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
          >
            Revise now
          </Link>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function ReportHistory() {
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return MOCK_REPORTS.filter((r) => {
      // Status filter
      if (statusFilter !== "All statuses" && r.status !== statusFilter)
        return false;

      // Date range filter
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (parseDate(r.date) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (parseDate(r.date) > to) return false;
      }

      return true;
    });
  }, [statusFilter, dateFrom, dateTo]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-4">
        <span className="hover:text-blue-500 cursor-pointer">Reports</span>
        <span className="mx-1.5">›</span>
        <span className="text-gray-600 font-medium">Report History</span>
      </p>

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My reports</h1>
          <p className="text-sm text-gray-400 mt-1">
            Everything you've submitted, with admin feedback.
          </p>
        </div>
        <Link
          to="/student/submit-report"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <FiUpload size={14} />
          Submit a report
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 shrink-0" />

        {/* Date from */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-sm text-gray-400 bg-transparent outline-none cursor-pointer"
        />

        <span className="text-gray-400 text-sm shrink-0">to</span>

        {/* Date to */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-sm text-gray-400 bg-transparent outline-none cursor-pointer"
        />
      </div>

      {/* Report cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No reports found for the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportHistory;
