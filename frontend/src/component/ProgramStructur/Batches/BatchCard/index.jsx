import { RightOutlined, DownOutlined } from "@ant-design/icons";

import CategoryBadge from "../elements/CategoryBadge";

function BatchCard({
  batch,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}) {
  return (
    <div
      onClick={() => onSelect(batch)}
      className={`border rounded-xl p-4 cursor-pointer transition ${
        isSelected
          ? "border-blue-300 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">{batch.name}</h4>

        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(batch.id);
          }}
          className="text-gray-400 text-xs cursor-pointer hover:text-gray-600 p-1 rounded transition"
        >
          {isExpanded ? <DownOutlined /> : <RightOutlined />}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        {batch.courses.length} courses
      </p>

      {isExpanded && batch.courses.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-blue-100 pt-3">
          {batch.courses.map((course) => (
            <div key={course.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{course.name}</span>

              <CategoryBadge category={course.domain} />
            </div>
          ))}
        </div>
      )}

      {isExpanded && batch.courses.length === 0 && (
        <p className="text-xs text-gray-400 mt-3 italic">
          No courses assigned yet.
        </p>
      )}
    </div>
  );
}

export default BatchCard;
