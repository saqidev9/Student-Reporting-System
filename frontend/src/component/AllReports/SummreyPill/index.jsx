import React, { useMemo } from "react";

function Pill({ color, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150
        ${
          active
            ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: active ? "white" : color }}
      />
      {label}
      <span className={`font-bold ${active ? "text-white" : "text-gray-800"}`}>
        {count}
      </span>
    </button>
  );
}

function SummaryPills({ reports, activeStatus, onStatusClick }) {
  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      needs_revision: reports.filter((r) => r.status === "needs_revision")
        .length,
      approved: reports.filter((r) => r.status === "approved").length,
      rejected: reports.filter((r) => r.status === "rejected").length,
    }),
    [reports],
  );

  const PILLS = [
    { key: "all", color: "#3B82F6", label: "Total", count: counts.total },
    {
      key: "pending",
      color: "#F59E0B",
      label: "Pending",
      count: counts.pending,
    },
    {
      key: "needs_revision",
      color: "#8B5CF6",
      label: "Needs Revision",
      count: counts.needs_revision,
    },
    {
      key: "approved",
      color: "#10B981",
      label: "Approved",
      count: counts.approved,
    },
    {
      key: "rejected",
      color: "#EF4444",
      label: "Rejected",
      count: counts.rejected,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map((p) => (
        <Pill
          key={p.key}
          color={p.color}
          label={p.label}
          count={p.count}
          active={activeStatus === p.key}
          onClick={() => onStatusClick(p.key)}
        />
      ))}
    </div>
  );
}

export default React.memo(SummaryPills);
