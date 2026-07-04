import React, { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:3000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Dropdown button that fetches all tags you've created, hides the ones
 * already assigned to this student, and lets you click one to assign it.
 *
 * Props:
 * - assignedTagIds: array of tag ids already on the student (to exclude)
 * - onAssign: async (tagId) => { success, message }
 */
function TagPicker({ assignedTagIds = [], onAssign }) {
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const wrapperRef = useRef(null);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDropdown = async () => {
    setOpen((prev) => !prev);
    if (allTags.length === 0) {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/api/tags`, {
          headers: authHeader(),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? "Failed to load tags");
        setAllTags(data.data.tags ?? []);
      } catch (err) {
        console.error("Failed to load tags:", err);
        setError("Could not load tags.");
      } finally {
        setLoading(false);
      }
    }
  };

  const availableTags = allTags.filter(
    (tag) => !assignedTagIds.includes(tag.id),
  );

  const handleAssign = async (tag) => {
    setAssigningId(tag.id);
    const result = await onAssign(tag);
    setAssigningId(null);
    if (result?.success) {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        onClick={openDropdown}
        className="text-xs font-medium border border-dashed border-gray-300 rounded-full px-3 py-1 text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition"
      >
        + Add tag
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
          {loading && (
            <p className="text-xs text-gray-400 px-3 py-2">Loading tags…</p>
          )}
          {error && <p className="text-xs text-red-500 px-3 py-2">{error}</p>}
          {!loading && !error && availableTags.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">
              {allTags.length === 0
                ? "No tags created yet."
                : "All tags already assigned."}
            </p>
          )}
          {!loading &&
            availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                disabled={assigningId === tag.id}
                onClick={() => handleAssign(tag)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-between"
              >
                {tag.name}
                {assigningId === tag.id && (
                  <span className="text-xs text-gray-400">Adding…</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default TagPicker;
