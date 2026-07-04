import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileTextOutlined,
  RiseOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import StarRating from "../StarRating";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekLabel(offset) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToSun = day === 0 ? 0 : day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - diffToSun + offset * 7);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = saturday.getFullYear();
  return `${fmt(sunday)} – ${fmt(saturday)}, ${year}`;
}

function getMonthLabel(offset) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function parseCompletionRate(val) {
  if (!val) return "0%";
  if (typeof val === "string") return val;
  return `${val}%`;
}

function getProductivityColor(val) {
  if (!val) return "text-gray-400";
  const v = val.toLowerCase();
  if (v === "high") return "text-green-600";
  if (v === "average") return "text-yellow-500";
  return "text-red-500";
}

function capitalize(str) {
  if (!str) return "N/A";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  children,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-500",
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          {icon}
        </span>
        {label}
      </div>
      {children}
    </div>
  );
}

function ReportBreakdownTable({ reports }) {
  const cols = [
    { key: "submitted", label: "SUBMITTED", color: "text-gray-800" },
    { key: "onTime", label: "ON TIME", color: "text-green-600" },
    { key: "late", label: "LATE", color: "text-red-500" },
    { key: "approved", label: "APPROVED", color: "text-green-600" },
    { key: "rejected", label: "REJECTED", color: "text-red-500" },
    { key: "needsRevision", label: "NEEDS REVISION", color: "text-orange-500" },
    { key: "pending", label: "PENDING", color: "text-gray-500" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-gray-800 mb-1">Report breakdown</p>
      <p className="text-xs text-gray-400 mb-4">
        All report counts for this period.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className="text-left text-xs text-gray-400 font-semibold tracking-wide pb-3 pr-6 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {cols.map((c) => (
                <td
                  key={c.key}
                  className={`text-base font-semibold pr-6 ${c.color}`}
                >
                  {reports?.[c.key] ?? 0}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceCard({ attendance }) {
  const boxes = [
    {
      label: "Present",
      value: attendance?.present ?? 0,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
    {
      label: "Late",
      value: attendance?.late ?? 0,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-100",
    },
    {
      label: "Absent",
      value: attendance?.absent ?? 0,
      bg: "bg-red-50",
      text: "text-red-500",
      border: "border-red-100",
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-gray-800 mb-1">Attendance</p>
      <p className="text-xs text-gray-400 mb-4">
        Tracked sessions in this period.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {boxes.map((b) => (
          <div
            key={b.label}
            className={`${b.bg} border ${b.border} rounded-xl p-4`}
          >
            <p className={`text-2xl font-bold ${b.text}`}>{b.value}</p>
            <p className="text-xs text-gray-500 mt-1">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductivityCard({ productivity }) {
  const val = productivity?.average;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-gray-800 mb-1">Productivity</p>
      <p className="text-xs text-gray-400 mb-4">
        Most common rating this period.
      </p>
      <p className="text-sm text-gray-600">
        Average productivity this period:{" "}
        <span className={`font-semibold ${getProductivityColor(val)}`}>
          {capitalize(val)}
        </span>
      </p>
    </div>
  );
}

function FeedbackCard({ feedback }) {
  if (!feedback || feedback.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-gray-800 mb-1">
        Admin feedback received
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Written comments on your reports.
      </p>
      <div className="space-y-4">
        {feedback.map((fb, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-gray-600 mb-2">
              {fb.date
                ? new Date(fb.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </p>
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-sm text-gray-700 italic">
                {fb.comment || fb.text || fb.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onSubmit }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <FileTextOutlined className="text-2xl text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-700 mb-2">
        No reports submitted for this period
      </p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Once you start submitting daily reports, your metrics will appear here.
      </p>
      <button
        onClick={onSubmit}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
      >
        <UploadOutlined />
        Submit a report
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MyPerformance() {
  const navigate = useNavigate();
  const [view, setView] = useState("weekly"); // "weekly" | "monthly"
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);

    const param =
      view === "weekly" ? `weekOffset=${offset}` : `monthOffset=${offset}`;
    const endpoint =
      view === "weekly"
        ? `${API_BASE}/analytics/my/weekly?${param}`
        : `${API_BASE}/analytics/my/monthly?${param}`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load data");
      setData(json.data?.summary ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [view, offset, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset offset when switching tabs
  const handleTabChange = (tab) => {
    setView(tab);
    setOffset(0);
  };

  const periodLabel =
    view === "weekly" ? getWeekLabel(offset) : getMonthLabel(offset);

  const prevLabel = view === "weekly" ? "Previous week" : "Previous month";
  const nextLabel = view === "weekly" ? "Next week" : "Next month";

  const hasData = data && data.reports && data.reports.submitted > 0;
  const completionRate = parseCompletionRate(data?.completionRate);
  const avgScore = data?.scores?.average ?? null;
  const avgRating = data?.ratings?.average ?? null;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My performance</h1>
        <p className="text-sm text-gray-400 mt-1">
          Your weekly and monthly progress summary.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["weekly", "monthly"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-3 px-4 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              view === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Period Navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
        >
          <LeftOutlined className="text-xs" />
          {prevLabel}
        </button>

        <p className="text-sm font-semibold text-gray-700">{periodLabel}</p>

        <button
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
          className={`flex items-center gap-1 text-sm border rounded-lg px-3 py-2 transition ${
            offset >= 0
              ? "text-gray-300 border-gray-100 cursor-not-allowed"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {nextLabel}
          <RightOutlined className="text-xs" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
          {error}
        </div>
      ) : !hasData ? (
        <EmptyState onSubmit={() => navigate("/student/submit-report")} />
      ) : (
        <div className="space-y-5">
          {/* Top 4 stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reports Submitted */}
            <StatCard
              icon={<FileTextOutlined />}
              label="Reports submitted"
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            >
              <p className="text-3xl font-bold text-gray-800">
                {data.reports.submitted}
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-green-600 font-medium">
                  {data.reports.onTime} on time
                </span>
                {" · "}
                <span className="text-red-500 font-medium">
                  {data.reports.late} late
                </span>
              </p>
            </StatCard>

            {/* Completion Rate */}
            <StatCard
              icon={<RiseOutlined />}
              label="Completion rate"
              iconBg="bg-red-50"
              iconColor="text-red-500"
            >
              <p className="text-3xl font-bold text-red-500">
                {completionRate}
              </p>
              <p className="text-xs text-gray-400">
                vs. weekdays in the period
              </p>
            </StatCard>

            {/* Average Score */}
            <StatCard
              icon={<CheckSquareOutlined />}
              label="Average score"
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
            >
              <p className="text-3xl font-bold text-gray-800">
                {avgScore ?? "—"}
                <span className="text-base font-normal text-gray-400"> /5</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{
                    width: `${((parseFloat(avgScore) || 0) / 5) * 100}%`,
                  }}
                />
              </div>
            </StatCard>

            {/* Star Rating */}
            <StatCard
              icon={<ClockCircleOutlined />}
              label="Star rating"
              iconBg="bg-yellow-50"
              iconColor="text-yellow-500"
            >
              <div className="flex items-center gap-2">
                <StarRating
                  rating={parseFloat(avgRating) || 0}
                  max={5}
                  size={16}
                />
                <span className="text-sm text-gray-500">
                  ({parseFloat(avgRating)?.toFixed(2) ?? "—"})
                </span>
              </div>
              <p className="text-xs text-gray-400">
                from {data.ratings?.count ?? 0} rated report
                {data.ratings?.count !== 1 ? "s" : ""}
              </p>
            </StatCard>
          </div>

          {/* Report Breakdown Table */}
          <ReportBreakdownTable reports={data.reports} />

          {/* Attendance + Productivity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AttendanceCard attendance={data.attendance} />
            <ProductivityCard productivity={data.productivity} />
          </div>

          {/* Admin Feedback */}
          {data.feedback && data.feedback.length > 0 && (
            <FeedbackCard feedback={data.feedback} />
          )}
        </div>
      )}
    </div>
  );
}

export default MyPerformance;
