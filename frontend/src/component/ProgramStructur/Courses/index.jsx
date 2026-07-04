import React, { useEffect, useState } from "react";
import CourseGrid from "./elements/CourseCards/CourseGrid";
import CreateCourseModal from "./elements/CreateCourseModal";

import { getCourses, createCourse } from "./CourseServices";

function Courses({ batches }) {
  const [courses, setCourses] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();

      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (formData) => {
    try {
      await createCourse(formData);

      await fetchCourses();

      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };
  const getBatchCount = (courseId) => {
    return batches.filter((b) => b.courses.some((c) => c.id === courseId))
      .length;
  };
  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg"
        >
          + New Course
        </button>
      </div>

      <CourseGrid courses={courses} batchCount={getBatchCount} />

      <CreateCourseModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateCourse}
      />
    </>
  );
}

export default Courses;
