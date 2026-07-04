import React, { useState } from "react";
import DOMAIN_LABELS from "../../constants";
const DOMAINS = [
  "programming",
  "designing",
  "video_editing",
  "professional_skills",
];

function CreateCourseModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-5">+ New Course</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Course Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <select
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          >
            <option value="">Select Domain</option>

            {DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          <textarea
            rows={4}
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-5"
          />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#2563EB] text-white px-4 py-2 rounded-lg"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourseModal;
