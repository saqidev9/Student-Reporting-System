import React from "react";
import CourseCard from "../../CourseCards";

function CourseGrid({ courses, batchCount }) {
  if (!courses.length) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium">No Courses Found</h3>

        <p className="text-gray-500 mt-2">
          Create your first course to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          batchCount={batchCount(course.id)}
        />
      ))}
    </div>
  );
}

export default CourseGrid;
