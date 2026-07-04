import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, Tag, Modal, message } from "antd";
import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useStudentDetail } from "../../AllReports/hooks/useStudentDetail";
import EditStudentModal from "../../AllStudents/EditeModal";
import TagPicker from "./TagPicker";

const ANTD_COLORS = [
  "green",
  "gold",
  "red",
  "blue",
  "purple",
  "orange",
  "magenta",
  "cyan",
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#0EA5E9,#6366F1)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
];

function getAntdTagColor(tagId = "") {
  let hash = 0;
  for (let i = 0; i < tagId.length; i++) {
    hash = (hash * 31 + tagId.charCodeAt(i)) % ANTD_COLORS.length;
  }
  return ANTD_COLORS[Math.abs(hash) % ANTD_COLORS.length];
}

function getAvatarGradient(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const isApproved = status === "approved";
  const isPending = status === "pending";
  const label = isApproved
    ? "Approved"
    : isPending
      ? "Pending"
      : status === "rejected"
        ? "Needs Revision"
        : status;

  const colorClass = isApproved
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : isPending
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  const dotClass = isApproved
    ? "bg-emerald-500"
    : isPending
      ? "bg-blue-500"
      : "bg-amber-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function StarRating({ rating = 0 }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {"★".repeat(rating)}
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function StatCard({ value, label, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className={`rounded-xl px-4 py-4 text-center ${tones[tone]}`}>
      <p className="text-2xl font-semibold leading-none mb-1">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800">{value ?? "—"}</p>
    </div>
  );
}

const currentMonthLabel = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    student,
    reports,
    attendanceSummary,
    batches,
    courses,
    groups,
    loading,
    error,
    actionLoading,
    toggleStatus,
    updateStudent,
    assignTag,
    removeTag,
  } = useStudentDetail(studentId);

  const batchMap = Object.fromEntries(batches.map((b) => [b.id, b.name]));
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
  const groupMap = Object.fromEntries(groups.map((g) => [g.id, g.name]));

  const handleAssignTag = async (tag) => {
    const result = await assignTag(tag);
    if (result?.success) {
      message.success("Tag added");
    } else {
      message.error(result?.message ?? "Failed to add tag");
    }
    return result;
  };
  const handleRemoveTag = (tagId, tagName) => {
    Modal.confirm({
      title: "Remove tag?",
      content: `Remove "${tagName}" from ${student.name}?`,
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await removeTag(tagId);
        if (result?.success) {
          message.success("Tag removed");
        } else {
          message.error(result?.message ?? "Failed to remove tag");
        }
      },
    });
  };
  const handleToggleStatus = () => {
    if (!student) return;
    const willDeactivate = student.isActive;

    Modal.confirm({
      title: willDeactivate ? "Deactivate student?" : "Activate student?",
      content: willDeactivate
        ? `${student.name} will lose access to their account and will no longer appear in active rosters. Their data and reports will be preserved.`
        : `${student.name} will regain access to their account and reappear in active rosters.`,
      okText: willDeactivate ? "Deactivate" : "Activate",
      okButtonProps: { danger: willDeactivate },
      onOk: async () => {
        const result = await toggleStatus();
        if (result?.success) {
          message.success(
            willDeactivate ? "Student deactivated" : "Student activated",
          );
        } else {
          message.error(result?.message ?? "Failed to update status");
        }
      },
    });
  };

  const handleSaveEdit = async (payload) => {
    return updateStudent(payload);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading student…</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <p className="text-gray-500 text-sm">{error || "Student not found."}</p>
        <button
          onClick={() => navigate("/admin/all-student")}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          ← Back to students
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb + header actions */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-1.5">
            <Link
              to="/admin/all-student"
              className="hover:text-gray-600 transition"
            >
              Students
            </Link>
            <span className="mx-1.5 text-gray-300">›</span>
            <span className="text-gray-500">{student.name}</span>
          </p>
          <h3 className="text-[24px] font-semibold text-gray-900 tracking-tight">
            {student.name}
          </h3>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
          >
            <EditOutlined />
            Edit Student
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
              student.isActive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {student.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            {student.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar
            size={64}
            src={student.avatar}
            style={{
              background: getAvatarGradient(student.id ?? student.name),
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {student.name?.[0]}
          </Avatar>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-gray-900">
                {student.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    student.isActive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{student.email}</p>
            <div className="flex gap-2 mt-2.5">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 capitalize ring-1 ring-blue-100">
                Role · {student.role}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-200">
                Joined {formatDate(student.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
          <InfoBlock label="Batch" value={batchMap[student.batchId]} />
          <InfoBlock label="Course" value={courseMap[student.courseId]} />
          <InfoBlock label="Group" value={groupMap[student.groupId]} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Student ID
            </p>
            <p className="font-mono text-sm text-gray-700 bg-gray-50 inline-block px-2 py-0.5 rounded">
              {student.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Internal tags */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-0.5">Internal tags</h4>
          <p className="text-xs text-gray-400 mb-4">Visible to admins only.</p>
          <div className="flex flex-wrap gap-2 items-center">
            {student.tags?.length ? (
              student.tags.map((tag) => (
                <Tag
                  key={tag.id}
                  color={getAntdTagColor(tag.id)}
                  closable
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  onClose={(e) => {
                    e.preventDefault();
                    handleRemoveTag(tag.id, tag.name);
                  }}
                >
                  {tag.name}
                </Tag>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No tags yet</span>
            )}
            <TagPicker
              assignedTagIds={student.tags?.map((t) => t.id) ?? []}
              onAssign={handleAssignTag}
            />
          </div>
        </div>
        {/* Attendance summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">
                Attendance · this month
              </h4>
              <p className="text-xs text-gray-400">{currentMonthLabel}</p>
            </div>
            <Link
              to={`/Admin/attendence`}
              className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Full log <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              value={attendanceSummary.present}
              label="Present"
              tone="emerald"
            />
            <StatCard
              value={attendanceSummary.absent}
              label="Absent"
              tone="rose"
            />
            <StatCard
              value={attendanceSummary.late}
              label="Late"
              tone="amber"
            />
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Recent reports</h4>
            <p className="text-xs text-gray-400">
              Last {reports.length} submission{reports.length === 1 ? "" : "s"}{" "}
              from this student.
            </p>
          </div>
          <Link
            to={`/admin/reports?studentId=${student.id}`}
            className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View all reports <ArrowRightOutlined style={{ fontSize: 11 }} />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No reports submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                  <th className="py-2.5 px-1 font-semibold">Date</th>
                  <th className="py-2.5 px-1 font-semibold">Topic</th>
                  <th className="py-2.5 px-1 font-semibold">Status</th>
                  <th className="py-2.5 px-1 font-semibold">Score</th>
                  <th className="py-2.5 px-1 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-1 text-gray-500">
                      {formatDate(report.reportDate)}
                    </td>
                    <td className="py-3.5 px-1 font-medium text-gray-800">
                      {report.whatStudied}
                    </td>
                    <td className="py-3.5 px-1">
                      <StatusPill status={report.status} />
                    </td>
                    <td className="py-3.5 px-1 text-gray-700">
                      {report.evaluation?.score != null
                        ? report.evaluation.score.toFixed(1)
                        : "—"}
                    </td>
                    <td className="py-3.5 px-1">
                      <StarRating rating={report.evaluation?.starRating ?? 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditStudentModal
          student={student}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default StudentDetail;
