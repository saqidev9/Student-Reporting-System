// src/component/Attandence/MarkAttendence.jsx
import React, { useEffect, useState } from "react";

const Base_Api = "http://localhost:3000";
const today = () => new Date().toISOString().slice(0, 10);

// Maps lowercase API status <-> capitalized UI label
const STATUS_TO_UI = { present: "Present", late: "Late", absent: "Absent" };

function MarkAttendence({ onClose, onSuccess, editRecord }) {
  const isEditMode = Boolean(editRecord);

  const [status, setStatus] = useState(
    isEditMode ? STATUS_TO_UI[editRecord.status] || "" : "",
  );
  const [students, setStudents] = useState([]);
  const [selectStudent, setSelectStudent] = useState(
    isEditMode ? editRecord.studentId : "",
  );
  const [date, setDate] = useState(isEditMode ? editRecord.date : today());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only fetch the student list when creating (dropdown needed).
  // In edit mode the student is already known and locked.
  useEffect(() => {
    if (!isEditMode) fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudent = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${Base_Api}/api/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        console.error(result.message);
        return;
      }
      setStudents(result.data.students);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!selectStudent) return setError("Please select a student.");
    if (!date) return setError("Please select a date.");
    if (!status) return setError("Please select a status.");

    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const res = await fetch(`${Base_Api}/api/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectStudent,
          date,
          status: status.toLowerCase(),
          isManual: true,
        }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.message ||
            `Failed to ${isEditMode ? "update" : "mark"} attendance`,
        );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[560px] rounded-xl shadow-xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Edit attendance" : "Mark attendance"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-xl cursor-pointer hover:text-red-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Student — dropdown when creating, locked display when editing */}
          <div>
            <label className="text-sm font-medium">
              Student <span className="text-red-500">*</span>
            </label>

            {isEditMode ? (
              <div className="mt-2 w-full border border-[#e5e7eb] rounded-lg px-3 py-3 bg-gray-50 text-gray-700">
                {editRecord.name}
              </div>
            ) : (
              <select
                value={selectStudent}
                onChange={(e) => setSelectStudent(e.target.value)}
                className="mt-2 w-full border border-[#e5e7eb] rounded-lg px-3 py-3 text-gray-700 outline-none"
              >
                <option value="" disabled>
                  Search by name...
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full border border-[#e5e7eb] rounded-lg px-3 py-3 outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStatus("Present")}
                className={`border border-[#e5e7eb] cursor-pointer rounded-lg py-6 ${status === "Present" ? "border-green-500 bg-green-50" : ""}`}
              >
                <div className="text-green-500 text-xl cursor-pointer">✓</div>
                Present
              </button>
              <button
                type="button"
                onClick={() => setStatus("Late")}
                className={`border border-[#e5e7eb] cursor-pointer rounded-lg py-6 ${status === "Late" ? "border-yellow-500 bg-yellow-50" : ""}`}
              >
                <div className="text-yellow-500 text-xl cursor-pointer">▣</div>
                Late
              </button>
              <button
                type="button"
                onClick={() => setStatus("Absent")}
                className={`border border-[#e5e7eb] cursor-pointer rounded-lg py-6 ${status === "Absent" ? "border-red-500 bg-red-50" : ""}`}
              >
                <div className="text-red-500 text-xl cursor-pointer">×</div>
                Absent
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-5">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 text-gray-600 cursor-pointer hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#2563EB] hover:bg-[#2559c9] cursor-pointer text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Marking..."
                : isEditMode
                  ? "Update attendance"
                  : "Mark attendance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkAttendence;
