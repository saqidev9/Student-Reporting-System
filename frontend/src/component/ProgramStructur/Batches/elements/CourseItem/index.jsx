// CourseItem.jsx
import { FileTextOutlined } from "@ant-design/icons";
import CategoryBadge from "../CategoryBadge";

function CourseItem({ course }) {
  return (
    <div className="flex justify-between items-center py-4">
      {/* Left */}
      <div className="flex gap-3 items-center">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
          <FileTextOutlined className="text-blue-500 text-base" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-800 leading-snug">
            {course.name} {/* ← was course.title */}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-sm">
            {course.description}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="shrink-0 ml-4">
        <CategoryBadge category={course.domain} /> {/* ← was course.category */}
      </div>
    </div>
  );
}

export default CourseItem;
