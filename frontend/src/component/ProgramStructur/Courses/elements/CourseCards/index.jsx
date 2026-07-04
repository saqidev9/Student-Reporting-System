import React from "react";
import CategoryBadge from "../../../Batches/elements/CategoryBadge";

function CourseCard({ course, batchCount }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <CategoryBadge category={course.domain} />
        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
          {batchCount > 0
            ? `${batchCount} batch${batchCount > 1 ? "es" : ""}`
            : "Unassigned"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
      <p className="text-sm text-gray-600 mt-2">{course.description}</p>
    </div>
  );
}

export default CourseCard;
