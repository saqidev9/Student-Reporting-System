import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function EditStudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student.name ?? "",
    email: student.email ?? "",
    batchId: student.batchId ?? "",
    courseId: student.courseId ?? "",
    groupId: student.groupId ?? "",
  });

  const [batches, setBatches] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tracks whether the courseId/groupId-driven effects have run once,
  // so we don't wipe the student's existing course/group the moment
  // batches/courses first load.
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      setBatchError("");
      try {
        const response = await fetch(`${API_BASE}/api/program/batches`, {
          method: "GET",
          headers: authHeader(),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? "Failed to load batches");
        setBatches(data.data.batches ?? []);
      } catch (error) {
        console.error("Failed to load batches:", error);
        setBatchError("Could not load batches. Please try again.");
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!form.batchId) {
      setFilteredCourses([]);
      setFilteredGroups([]);
      return;
    }
    const selectedBatch = batches.find(
      (batch) => String(batch.id) === String(form.batchId),
    );
    setFilteredCourses(selectedBatch?.courses ?? []);

    if (initialized) {
      setFilteredGroups([]);
      setForm((prev) => ({ ...prev, courseId: "", groupId: "" }));
    }
  }, [form.batchId, batches, initialized]);

  useEffect(() => {
    if (!form.courseId) {
      setFilteredGroups([]);
      setInitialized(true);
      return;
    }

    let cancelled = false;
    const fetchGroups = async () => {
      setLoadingGroups(true);
      setGroupError("");
      try {
        const response = await fetch(
          `${API_BASE}/api/program/groups?courseId=${form.courseId}`,
          { method: "GET", headers: authHeader() },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? "Failed to load groups");
        if (!cancelled) {
          setFilteredGroups(data.data.groups ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load groups:", error);
          setGroupError("Could not load groups.");
          setFilteredGroups([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGroups(false);
          setInitialized(true);
        }
      }
    };
    fetchGroups();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.name || !form.email) {
      setSubmitError("Please fill in name and email.");
      return;
    }
    if (!form.batchId || !form.courseId || !form.groupId) {
      setSubmitError("Please select a batch, course, and group.");
      return;
    }

    setSubmitting(true);
    const result = await onSave({
      name: form.name,
      email: form.email,
      batchId: form.batchId,
      courseId: form.courseId,
      groupId: form.groupId,
    });
    setSubmitting(false);

    if (!result?.success) {
      setSubmitError(result?.message ?? "Failed to update student");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Edit student</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Enrollment */}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">
              Enrollment
            </p>
            {batchError && (
              <p className="text-xs text-red-500 mb-2">{batchError}</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  disabled={loadingBatches}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {loadingBatches ? "Loading…" : "Select batch"}
                  </option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  disabled={!form.batchId || filteredCourses.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {!form.batchId ? "Select batch first" : "Choose course"}
                  </option>
                  {filteredCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="groupId"
                  value={form.groupId}
                  onChange={handleChange}
                  disabled={!form.courseId || loadingGroups}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {!form.courseId
                      ? "Select course first"
                      : loadingGroups
                        ? "Loading…"
                        : "Choose group"}
                  </option>
                  {filteredGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {groupError && (
                  <p className="text-xs text-red-500 mt-1">{groupError}</p>
                )}
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-500 mb-4">{submitError}</p>
          )}

          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-[#2563EB] text-white font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentModal;
