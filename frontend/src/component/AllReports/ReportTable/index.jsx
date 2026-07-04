import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Avatar, Tag } from "antd";
import { STATUS_CONFIG, SUBMISSION_CONFIG } from "../constants";

// ── Relative time ─────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return "—";
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ value = 0, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < value ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.951-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

// ── Avatar color from name ────────────────────────────────────────────────────
function stringToColor(str = "") {
  const colors = [
    "#3B82F6",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#F97316",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Columns mapped to YOUR API fields ────────────────────────────────────────
const columns = (groupMap, navigate) => [
  {
    title: "STUDENT",
    key: "student",
    render: (_, record) => {
      const name = record.student?.name ?? "—";
      const groupId = record.student?.groupId ?? "—";

      const group = groupMap[groupId];

      return (
        <div className="flex items-center gap-3">
          <Avatar
            size={36}
            style={{ backgroundColor: stringToColor(name), flexShrink: 0 }}
          >
            {name.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {name}
            </p>

            <p className="text-xs text-gray-400">{group}</p>
          </div>
        </div>
      );
    },
  },
  {
    title: "DATE",
    key: "date",
    render: (_, record) => (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          {record.reportDate
            ? new Date(record.reportDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
        {/* 👇 isLate comes directly from your API */}
        {record.isLate && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600 uppercase tracking-wide">
            Late
          </span>
        )}
      </div>
    ),
  },
  {
    title: "STATUS",
    dataIndex: "status", // 👈 your API field
    key: "status",
    render: (val) => {
      const cfg = STATUS_CONFIG[val];
      return cfg ? (
        <Tag
          color={cfg.color}
          className="!rounded-full !px-3 !py-0.5 !text-xs !font-medium"
        >
          {cfg.label}
        </Tag>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    title: "STARS",
    key: "stars",
    render: (_, record) => {
      // 👇 stars live inside evaluation — null until reviewed
      const stars = record.evaluation?.starRating ?? 0;
      return <StarRating value={stars} />;
    },
  },
  {
    title: "SCORE",
    key: "score",
    render: (_, record) => {
      // 👇 score also inside evaluation
      const score = record.evaluation?.score;
      return (
        <span className="text-sm font-semibold text-gray-800">
          {score !== undefined && score !== null ? `${score}/5` : "—"}
        </span>
      );
    },
  },
  {
    title: "SUBMITTED",
    dataIndex: "submittedAt", // 👈 your API field
    key: "submittedAt",
    render: (val) => (
      <span className="text-sm text-gray-500">{timeAgo(val)}</span>
    ),
  },
  {
    title: "ACTION",
    key: "action",
    render: (_, record) => (
      <button
        onClick={() => navigate(`/admin/All-Reports/${record.id}`)} // 👈 your API uses "id" not "_id"
        className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap cursor-pointer"
      >
        Review →
      </button>
    ),
  },
];

function ReportsTable({
  data = [],
  loading = false,
  groupMap = {},
  batches,
  courses,
  groups,
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <Table
        columns={columns(groupMap, navigate)}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} reports`,
        }}
        scroll={{ x: 900 }}
        size="middle"
      />
    </div>
  );
}
export default ReportsTable;
