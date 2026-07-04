// AssignedCourses.jsx
import { PlusOutlined, BookOutlined } from "@ant-design/icons";
import CourseItem from "../CourseItem";

function AssignedCourses({ batch, onAssignCourse }) {
  const courseCount = batch.courses.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Assigned courses</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {courseCount} course{courseCount !== 1 ? "s" : ""} in{" "}
            <span className="font-medium text-gray-500">{batch.name}</span>
          </p>
        </div>

        <button
          onClick={onAssignCourse}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150"
        >
          <PlusOutlined />
          Assign course
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Course List */}
      {courseCount === 0 ? (
        <EmptyState onAssignCourse={onAssignCourse} />
      ) : (
        <div className="divide-y divide-gray-100">
          {batch.courses.map((course) => (
            <CourseItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAssignCourse }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <BookOutlined className="text-2xl text-blue-400" />
      </div>
      <h4 className="text-gray-700 font-semibold text-sm mb-1">
        No courses assigned yet
      </h4>
      <p className="text-gray-400 text-xs text-center max-w-xs mb-4">
        Start building this batch by assigning the first course.
      </p>
      <button
        onClick={onAssignCourse}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
      >
        <PlusOutlined />
        Assign course
      </button>
    </div>
  );
}

export default AssignedCourses;
