import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

function AddStudent({ onClose, onCreated }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batchId: "",
    courseId: "",
    groupId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [batches, setBatches] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Fetch batches on mount
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

  // When batch changes, load its courses
  useEffect(() => {
    if (!form.batchId) {
      setFilteredCourses([]);
      setFilteredGroups([]);
      setForm((prev) => ({ ...prev, courseId: "", groupId: "" }));
      return;
    }
    const selectedBatch = batches.find(
      (batch) => String(batch.id) === String(form.batchId),
    );
    setFilteredCourses(selectedBatch?.courses ?? []);
    setFilteredGroups([]);
    setForm((prev) => ({ ...prev, courseId: "", groupId: "" }));
  }, [form.batchId, batches]);

  // ✅ FIXED: Fetch groups when courseId is selected (removed batchId dependency)
  useEffect(() => {
    setForm((prev) => ({ ...prev, groupId: "" }));

    if (!form.courseId) {
      // ✅ only check courseId
      setFilteredGroups([]);
      return;
    }

    let cancelled = false;

    const fetchGroups = async () => {
      setLoadingGroups(true);
      setGroupError("");
      try {
        const response = await fetch(
          `${API_BASE}/api/program/groups?courseId=${form.courseId}`, // ✅ only courseId
          {
            method: "GET",
            headers: authHeader(),
          },
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
        if (!cancelled) setLoadingGroups(false);
      }
    };

    fetchGroups();

    return () => {
      cancelled = true;
    };
  }, [form.courseId]); // ✅ only courseId in deps

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.name || !form.email || !form.password) {
      setSubmitError("Please fill in name, email, and password.");
      return;
    }
    if (!form.batchId || !form.courseId || !form.groupId) {
      setSubmitError("Please select a batch, course, and group.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Failed to create student");
      onCreated?.(data.data.student);
      onClose?.();
      navigate("/admin/all-student");
    } catch (error) {
      console.error(error);
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Add student</h2>
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
                placeholder="Enter your full name"
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
              <p className="text-xs text-gray-400 mt-1">
                Used by the student to sign in.
              </p>
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="text-sm text-gray-500 mb-1 block">
              Temporary password <span className="text-red-500">*</span>
            </label>
            <div className="relative w-1/2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              The student can change this after first sign-in.
            </p>
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
              {/* Batch */}
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

              {/* Course */}
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

              {/* Group */}
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

          {/* Submit error */}
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
              {submitting ? "Creating…" : "Create student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;
