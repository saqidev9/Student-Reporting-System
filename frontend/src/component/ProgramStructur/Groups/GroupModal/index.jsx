import React, { useState, useEffect } from "react";

function GroupModal({ onClose, setGroups, batches, courses }) {
  const [name, setName] = useState("");
  const [batchId, setBatchId] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    console.log("Courses:", courses);
    console.log("Batches:", batches);
  }, [courses, batches]);
  const handleBatchChange = (id) => {
    setBatchId(id);
    setCourseId(null);

    // Courses are already inside the batch object — no API call needed!
    const selectedBatch = batches.find((b) => b.id === id);
    setFilteredCourses(selectedBatch?.courses || []);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !batchId || !courseId) return;

    const payload = {
      name,
      batchId,
      courseId,
    };

    try {
      const response = await fetch("http://localhost:3000/api/program/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log(result);
      if (!response.ok) console.error(result.message);

      const newGroup = result.data.group || {
        id: Date.now(),
        ...payload,
      };

      setGroups((prev) => [...prev, newGroup]);

      onClose();
    } catch (error) {
      console.error(error);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[420px] p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Create Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <input
            className="w-full border p-2 rounded"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Batch Dropdown */}
          <select
            className="w-full border p-2 rounded"
            value={batchId || ""}
            onChange={(e) => handleBatchChange(e.target.value)}
          >
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Course Dropdown */}
          <select
            className="w-full border p-2 rounded"
            value={courseId || ""}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={!batchId}
          >
            <option value="">
              {batchId ? "Select Course" : "Select batch first"}
            </option>

            {Array.isArray(filteredCourses) &&
              filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupModal;
