// src/component/Attandence/AttandenceTable/index.jsx
import React from "react";
import { Avatar, Table, Tag, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const STATUS_STYLES = {
  present: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Present",
  },
  late: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    label: "Late",
  },
  absent: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Absent",
  },
};

function formatAttendanceDate(dateString) {
  if (!dateString) return "—";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AttendenceTable({ records, groupMap, loading, onEditAttendance }) {
  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => {
        const name = record.name ?? "—";
        const groupId = record.groupId;

        const group = groupMap[groupId] ?? "—";
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={record.avatar}
              style={{ backgroundColor: stringToColor(name), flexShrink: 0 }}
            >
              {getInitials(name)}
            </Avatar>
            <div>
              <p className="font-medium text-gray-800">{name}</p>
              <p className="text-gray-500 text-xs">{group}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <span className="text-gray-700 text-sm">
          {formatAttendanceDate(record.date)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const style = STATUS_STYLES[record.status] || STATUS_STYLES.absent;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
        );
      },
    },
    {
      title: "Marked As",
      key: "markedAs",
      render: (_, record) => (
        <Tag className="bg-gray-100 text-gray-600 border-0 rounded px-2.5 py-1">
          {record.markedAs || "Automatic"}
        </Tag>
      ),
    },
    {
      title: "Edit",
      key: "edit",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEditAttendance?.(record)}
        />
      ),
    },
  ];

  return (
    <div className="px-4">
      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `${t} records`,
        }}
        scroll={{ x: 700 }}
        size="middle"
        locale={{ emptyText: "No attendance records found." }}
      />
    </div>
  );
}

export default AttendenceTable;
