// component/Student Components/SubmitReport.jsx
import React, { useState } from "react";
import {
  FiUpload,
  FiCheckCircle,
  FiCalendar,
  FiBook,
  FiClock,
  FiZap,
  FiAlertTriangle,
  FiFileText,
} from "react-icons/fi";

// ── constants ─────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  date: new Date().toISOString().split("T")[0],
  studied: "",
  timeSpent: "",
  learned: "",
  challenges: "",
  progressNotes: "",
};

const TIME_OPTIONS = [
  "Less than 1 hour",
  "1 hour",
  "2 hours",
  "3 hours",
  "4 hours",
  "5+ hours",
];

// ── field config ──────────────────────────────────────────────────────────────
const FIELDS = [
  {
    key: "studied",
    label: "What I studied today",
    placeholder: "e.g. JWT authentication, React hooks, Express middleware...",
    icon: FiBook,
    type: "input",
    required: true,
    hint: "Topic or subject you focused on",
  },
  {
    key: "learned",
    label: "What I learned",
    placeholder:
      "Describe the key concepts, insights, or skills you gained today...",
    icon: FiZap,
    type: "textarea",
    rows: 5,
    required: true,
    hint: "Be specific — mention what clicked or what you understand better now",
  },
  {
    key: "challenges",
    label: "Challenges faced",
    placeholder:
      "What blocked you or was harder than expected? How did you approach it?",
    icon: FiAlertTriangle,
    type: "textarea",
    rows: 4,
    required: false,
    hint: "Honest reflection helps your mentor give better feedback",
  },
  {
    key: "progressNotes",
    label: "Progress notes",
    placeholder:
      "Any additional notes — links, resources, what to continue tomorrow...",
    icon: FiFileText,
    type: "textarea",
    rows: 3,
    required: false,
    hint: "Optional: links, next steps, or anything else worth noting",
  },
];

// ── sub-components ────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label, required, hint }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-blue-500 shrink-0" />
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5 ml-5">{hint}</p>}
    </div>
  );
}

function SuccessScreen({ onReset }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-10">
      <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
        <FiCheckCircle size={36} className="text-green-500" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Report submitted!</h2>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Your report has been sent for review. Your mentor will provide
          feedback shortly.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onReset}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
        >
          Submit another
        </button>
        <a
          href="/student/report-history"
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
        >
          View my reports
        </a>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function SubmitReport() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validate() {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required.";
    if (!form.studied.trim()) newErrors.studied = "This field is required.";
    if (!form.timeSpent) newErrors.timeSpent = "Please select time spent.";
    if (!form.learned.trim()) newErrors.learned = "This field is required.";
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ Map frontend field names → backend field names
      const payload = {
        reportDate: form.date,
        whatStudied: form.studied,
        timeSpent: form.timeSpent,
        whatLearned: form.learned,
        challenges: form.challenges,
        progressNotes: form.progressNotes,
      };

      const res = await fetch("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setErrors({
        global: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (success) return <SuccessScreen onReset={() => setSuccess(false)} />;

  const completedFields = [
    form.date,
    form.studied.trim(),
    form.timeSpent,
    form.learned.trim(),
    form.challenges.trim(),
    form.progressNotes.trim(),
  ].filter(Boolean).length;

  const totalFields = 6;
  const progress = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page header */}
      <div className="max-w-screen mx-auto">
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">
            <span className="hover:text-blue-500 cursor-pointer">Reports</span>
            <span className="mx-1.5">›</span>
            <span className="text-gray-600 font-medium">Submit Report</span>
          </p>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily report</h1>
              <p className="text-sm text-gray-400 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {/* Progress pill */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400">
                {completedFields}/{totalFields} filled
              </span>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* ── Row 1: Date + Time Spent ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <FieldLabel
                icon={FiCalendar}
                label="Date"
                required
                hint="Session date"
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 ${
                  errors.date ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1.5">{errors.date}</p>
              )}
            </div>

            {/* Time Spent */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <FieldLabel
                icon={FiClock}
                label="Time spent"
                required
                hint="How long you studied"
              />
              <select
                name="timeSpent"
                value={form.timeSpent}
                onChange={handleChange}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer ${
                  errors.timeSpent
                    ? "border-red-300 bg-red-50 text-gray-700"
                    : "border-gray-200 text-gray-700"
                } ${!form.timeSpent ? "text-gray-400" : ""}`}
              >
                <option value="" disabled>
                  Select duration...
                </option>
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.timeSpent && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.timeSpent}
                </p>
              )}
            </div>
          </div>

          {/* ── Remaining fields ── */}
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <FieldLabel
                icon={field.icon}
                label={field.label}
                required={field.required}
                hint={field.hint}
              />
              {field.type === "input" ? (
                <input
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-300 ${
                    errors[field.key]
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              ) : (
                <textarea
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={field.rows}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none placeholder-gray-300 leading-relaxed ${
                    errors[field.key]
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              )}
              {errors[field.key] && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}

          {/* ── Global error ── */}
          {errors.global && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <FiAlertTriangle size={14} className="shrink-0" />
              {errors.global}
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <p className="text-xs text-gray-400">
              <span className="text-red-400">*</span> Required fields
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiUpload size={15} />
                  Submit report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitReport;
