import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTags } from "./useTags";
import { useTagStudents, useAllStudents } from "./useTagStudent";
import { getTagColor, getAvatarInitials, getAvatarColor } from "./TagList";
import { IoInformationCircleOutline } from "react-icons/io5";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

// ─── New Tag Inline Form ───────────────────────────────────────────────────────
function NewTagForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tag name is required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await onSave(trimmed);
      setName("");
    } catch (err) {
      setError(err.message || "Failed to create tag.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 mb-2">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter tag name..."
        className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 rounded-md transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium py-1.5 rounded-md transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Tag List Item ─────────────────────────────────────────────────────────────
function TagItem({ tag, isSelected, onClick, studentCount }) {
  const color = getTagColor(tag.id);
  return (
    <div
      onClick={() => onClick(tag)}
      className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all
        ${isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${color.bg} ${color.text} ${color.border}`}
        >
          {tag.name}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">
          {studentCount ?? 0} students
        </span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
        >
          <HiOutlineDotsHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Student Avatar Row ────────────────────────────────────────────────────────
function StudentRow({ student, onRemove, removing }) {
  const initials = getAvatarInitials(student.name);
  const avatarColor = getAvatarColor(student.name);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{student.name}</p>
          <p className="text-xs text-gray-400">
            {[student.batch, student.program, student.group]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(student.id)}
        disabled={removing === student.id}
        className="text-gray-300 hover:text-red-400 transition disabled:opacity-40"
      >
        <IoClose size={18} />
      </button>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function TagDetailPanel({
  tag,
  tagStudents,
  allStudents,
  onAssign,
  onRemoveStudent,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const color = getTagColor(tag.id);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const assignedIds = useMemo(
    () => new Set((tagStudents || []).map((s) => s.id)),
    [tagStudents],
  );

  const filteredStudents = useMemo(() => {
    const unassigned = (allStudents || []).filter(
      (s) => !assignedIds.has(s.id),
    );
    if (!searchQuery.trim()) return unassigned;
    return unassigned.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allStudents, assignedIds]);

  const handleAssign = async () => {
    if (!selectedStudent) {
      setAssignError("Please select a student.");
      return;
    }
    try {
      setAssigning(true);
      setAssignError("");
      await onAssign(tag.id, selectedStudent.id);
      setSelectedStudent(null);
      setSearchQuery("");
    } catch (err) {
      setAssignError(err.message || "Failed to assign.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (studentId) => {
    setRemovingId(studentId);
    try {
      await onRemoveStudent(tag.id, studentId);
    } finally {
      setRemovingId(null);
    }
  };

  const students = tagStudents || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Tag header */}
      <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full border ${color.bg} ${color.text} ${color.border}`}
        >
          {tag.name}
        </span>
        <span className="text-sm text-gray-500">
          {students.length} students assigned
        </span>
      </div>

      {/* Assign to student */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          Assign to a student
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Pick a student to add this tag to their profile.
        </p>

        <div className="flex gap-2 relative" ref={dropdownRef}>
          <div className="relative flex-1">
            <input
              type="text"
              value={selectedStudent ? selectedStudent.name : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedStudent(null);
                setDropdownOpen(true);
                setAssignError("");
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search students..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
            {dropdownOpen && filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudent(s);
                      setSearchQuery(s.name);
                      setDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                  >
                    <span className="font-medium">{s.name}</span>
                    {s.group && (
                      <span className="text-gray-400 text-xs ml-2">
                        {s.group}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-1 disabled:opacity-60"
          >
            {assigning ? "..." : "+ Assign"}
          </button>
        </div>
        {assignError && (
          <p className="text-xs text-red-500 mt-1">{assignError}</p>
        )}
      </div>

      {/* Students with this tag */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          Students with this tag
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {students.length} assigned.
        </p>

        {students.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No students assigned yet.
          </p>
        ) : (
          <div>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onRemove={handleRemove}
                removing={removingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Tags Page ────────────────────────────────────────────────────────────
function Tags() {
  const {
    tags,
    loading,
    error,
    createTag,
    assignStudent,
    removeStudentFromTag,
  } = useTags();
  const [selectedTag, setSelectedTag] = useState(null);
  const [showNewTagForm, setShowNewTagForm] = useState(false);

  // ✅ FIXED: useAllStudents first, then pass allStudents into useTagStudents
  const { allStudents, refetchStudents } = useAllStudents();
  const { tagStudents } = useTagStudents(selectedTag?.id, allStudents);

  // Auto-select first tag when tags load
  useEffect(() => {
    if (tags.length > 0 && !selectedTag) {
      setSelectedTag(tags[0]);
    }
  }, [tags]);

  const handleCreateTag = async (name) => {
    await createTag(name);
    setShowNewTagForm(false);
  };

  // ✅ FIXED: refetchStudents() instead of refetchTagStudents(tagId)
  const handleAssign = async (tagId, studentId) => {
    await assignStudent(tagId, studentId);
    await refetchStudents();
  };

  const handleRemoveStudent = async (tagId, studentId) => {
    await removeStudentFromTag(tagId, studentId);
    await refetchStudents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          Failed to load tags: {error}
        </div>
      </div>
    );
  }
  // Temporarily add this right before the return in Tags()
  console.log("tags:", tags);
  console.log("tags[0]:", tags[0]);
  console.log("tags[0].id:", tags[0]?.id);
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-sm text-gray-500 mt-1">
            Internal labels for organizing students. Tags are never visible to
            students.
          </p>
        </div>
        <button
          onClick={() => setShowNewTagForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          + New tag
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
        <IoInformationCircleOutline size={18} className="flex-shrink-0" />
        <span>
          These tags are internal only. Students cannot see tags assigned to
          them.
        </span>
      </div>

      {/* Body: Left list + Right panel */}
      <div className="flex gap-6">
        {/* Left: Tag List */}
        <div className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-3 h-fit">
          {showNewTagForm && (
            <NewTagForm
              onSave={handleCreateTag}
              onCancel={() => setShowNewTagForm(false)}
            />
          )}

          {tags.length === 0 && !showNewTagForm ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No tags yet. Create one!
            </p>
          ) : (
            tags.map((tag) => (
              <TagItem
                key={tag.id}
                tag={tag}
                isSelected={selectedTag?.id === tag.id}
                onClick={(t) => {
                  setSelectedTag(t);
                  setShowNewTagForm(false);
                }}
                // ✅ FIXED: count for every tag, not just selected
                studentCount={
                  (allStudents || []).filter(
                    (s) =>
                      Array.isArray(s.tags) &&
                      s.tags.some((t) => t.id === tag.id),
                  ).length
                }
              />
            ))
          )}
        </div>

        {/* Right: Tag Detail Panel */}
        <div className="flex-1">
          {selectedTag ? (
            <TagDetailPanel
              tag={selectedTag}
              tagStudents={tagStudents}
              allStudents={allStudents}
              onAssign={handleAssign}
              onRemoveStudent={handleRemoveStudent}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
              Select a tag to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tags;
