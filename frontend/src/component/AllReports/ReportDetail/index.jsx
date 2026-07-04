import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useProgramStructure } from "../../AllReports/hooks/useProgramStructure";

const Base_Api = "http://localhost:3000";
const REPORT_STATUS_CONFIG = {
  pending: { label: "Pending", color: "orange" },
  approved: { label: "Approved", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  needs_revision: { label: "Needs Revision", color: "purple" }, // was "revision"
};

const EVAL_STATUS_OPTIONS = [
  {
    key: "approved",
    label: "Approve",
    desc: "Solid work.",
    selectedStyle: "border-green-500 bg-green-50",
  },
  {
    key: "needs_revision",
    label: "Needs revision",
    desc: "Send back with feedback.",
    selectedStyle: "border-orange-500 bg-orange-50",
  }, // was "revision"
  {
    key: "rejected",
    label: "Reject",
    desc: "Incomplete submission.",
    selectedStyle: "border-red-500 bg-red-50",
  },
  {
    key: "pending",
    label: "Keep pending",
    desc: "Not ready to decide.",
    selectedStyle: "border-blue-500 bg-blue-50",
  },
];

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

function Section({ icon, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400 text-base">{icon}</span>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {children || (
          <span className="text-gray-400 italic">Nothing provided</span>
        )}
      </p>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="cursor-pointer"
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              star <= (hovered ?? value) ? "text-yellow-400" : "text-gray-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.951-.69l1.286-3.957z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
            value === opt.value
              ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { batches, courses, groups } = useProgramStructure();

  const [report, setReport] = useState(null);
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evaluate sidebar state
  const [evalStatus, setEvalStatus] = useState("pending");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [stars, setStars] = useState(0);
  const [attendance, setAttendance] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const batchMap = Object.fromEntries(
    batches.map((b) => [String(b.id), b.name]),
  );
  const courseMap = Object.fromEntries(
    courses.map((c) => [String(c.id), c.name]),
  );
  const groupMap = Object.fromEntries(
    groups.map((g) => [String(g.id), g.name]),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch(`${Base_Api}/api/reports/${reportId}`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load report");
        const data = await res.json();
        const record = data.data.report;
        const studentData = data.data.student;
        if (!record) throw new Error("Report not found");

        setReport(record);
        setEvalStatus(record.status || "pending");
        if (record.evaluation) {
          setFeedback(record.evaluation.feedback || "");
          setScore(record.evaluation.score ?? null);
          setStars(record.evaluation.starRating ?? 0);
          setProductivity(record.evaluation.productivity || null);
        }

        return Promise.all([
          Promise.resolve(studentData),
          fetch(`${Base_Api}/api/students/${record.studentId}`, {
            headers,
          }).then((r) => (r.ok ? r.json() : null)),
        ]);
      })
      .then(([basicStudent, fullStudentRes]) => {
        const fullStudent =
          fullStudentRes?.data?.student || fullStudentRes?.data || {};
        setStudent({ ...basicStudent, ...fullStudent }); // ✅ fixed
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleSaveEvaluation = async () => {
    setSaveError("");
    setSaveSuccess(false);
    if (!evalStatus) return setSaveError("Please select a status.");

    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${Base_Api}/api/reports/${reportId}/evaluate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: evalStatus,
          feedback,
          score,
          starRating: stars, // matches API field name
          attendance,
          productivity,
        }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to save evaluation");

      // Update report status locally so UI reflects change immediately
      setReport((prev) => ({ ...prev, status: evalStatus }));
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
        Loading report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-red-500 text-sm">{error || "Report not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const statusCfg = REPORT_STATUS_CONFIG[report.status] || {
    label: report.status,
    color: "default",
  };

  const reportDate = report.reportDate
    ? new Date(report.reportDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const submittedAt = report.submittedAt
    ? new Date(report.submittedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div className="p-6">
      {/* Page title + breadcrumb + back button */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {student.name ? `${student.name}'s report` : "Report"}
          </h1>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <button
              onClick={() => navigate("/admin/All-Reports")}
              className="hover:text-blue-500 cursor-pointer"
            >
              Reports
            </button>
            <span>›</span>
            <span>{student.name || "Student"}</span>
            <span>›</span>
            <span>{reportDate}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
        >
          <ArrowLeftOutlined />
          All reports
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* ── Left: report content ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Student header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: stringToColor(student.name || ""),
                    flexShrink: 0,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {student.name ? student.name.slice(0, 2).toUpperCase() : "?"}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-gray-900">
                      {student.name || "Unknown Student"}
                    </h2>
                    <Tag
                      color={statusCfg.color}
                      className="!rounded-full !px-2.5 !py-0 !text-xs !font-medium !m-0"
                    >
                      {statusCfg.label}
                    </Tag>
                    {report.isLate && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-100 text-orange-600 uppercase tracking-wide">
                        Late
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {batchMap[String(student.batchId)] ||
                      student.batchId ||
                      "—"}
                    {" · "}
                    {courseMap[String(student.courseId)] ||
                      student.courseId ||
                      "—"}
                    {" · "}
                    {groupMap[String(student.groupId)] ||
                      student.groupId ||
                      "—"}
                  </p>
                </div>
              </div>
              {submittedAt && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">{submittedAt}</p>
                  <p className="text-xs text-gray-400 mt-0.5">just now</p>
                </div>
              )}
            </div>
          </div>

          {/* Report sections */}
          <Section icon="📄" title="What I Studied">
            {report.whatStudied}
          </Section>
          <Section icon="🕐" title="Time Spent">
            {report.timeSpent}
          </Section>
          <Section icon="✏️" title="What I Learned">
            {report.whatLearned}
          </Section>
          <Section icon="⚠️" title="Challenges Faced">
            {report.challenges}
          </Section>
          <Section icon="📈" title="Progress Notes">
            {report.progressNotes}
          </Section>

          {/* Revision history */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-gray-800 mb-0.5">
              Revision history
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Each status change on this report.
            </p>
            {report.revisionHistory?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {report.revisionHistory.map((rev, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          • {rev.toStatus}
                        </span>
                        {rev.changedBy && (
                          <span className="text-xs text-gray-400">
                            by {rev.changedBy}
                          </span>
                        )}
                      </div>
                      {rev.changedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(rev.changedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                    • {statusCfg.label}
                  </span>
                  {submittedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted · {submittedAt}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: evaluate sidebar ── */}
        <div className="w-[300px] flex-shrink-0 sticky top-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Evaluate
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Set a status, write feedback, and score this report.
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Status <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {EVAL_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEvalStatus(opt.key)}
                    className={`flex items-start gap-2 p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                      evalStatus === opt.key
                        ? opt.selectedStyle
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={evalStatus === opt.key}
                      className="mt-0.5 flex-shrink-0 accent-blue-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Feedback to Student
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here. This is visible to the student."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Score */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Score
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(n)}
                    className={`w-9 h-9 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                      score === n
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Star Rating
              </p>
              <StarPicker value={stars} onChange={setStars} />
            </div>

            {/* Attendance */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Attendance
              </p>
              <ToggleGroup
                value={attendance}
                onChange={setAttendance}
                options={[
                  { label: "Present", value: "present" },
                  { label: "Late", value: "late" },
                  { label: "Absent", value: "absent" },
                ]}
              />
            </div>

            {/* Productivity */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Productivity
              </p>
              <ToggleGroup
                value={productivity}
                onChange={setProductivity}
                options={[
                  { label: "Low", value: "low" },
                  { label: "Average", value: "average" },
                  { label: "Good", value: "good" },
                  { label: "Excellent", value: "excellent" },
                ]}
              />
            </div>

            {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
            {saveSuccess && (
              <p className="text-green-600 text-xs">
                Evaluation saved successfully.
              </p>
            )}

            <button
              onClick={handleSaveEvaluation}
              disabled={saving}
              className="w-full bg-[#2563EB] hover:bg-[#2559c9] text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save evaluation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
