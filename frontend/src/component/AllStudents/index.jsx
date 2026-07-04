import React, { useEffect, useState } from "react";
import AddStudent from "./AddStudent";
import RenderStudentList from "./RenderdStudenList";
import EditStudentModal from "./EditeModal";

function AllStudents() {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    batch: "all",
    course: "all",
    group: "all",
    status: "all",
  });

  const Base_Api = "http://localhost:3000";

  const handleDeleteStudent = async (studentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${Base_Api}/api/students/${studentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete");

      // Remove from local state instantly — no need to refetch
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  const handleUpdateStudent = async (payload) => {
    if (!editingStudent) return { success: false };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${Base_Api}/api/students/${editingStudent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? "Failed to update student");

      // Update this student in the local list instantly, no refetch needed
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, ...(data.data?.student ?? payload) }
            : s,
        ),
      );
      return { success: true };
    } catch (err) {
      console.error("Update student failed:", err);
      return { success: false, message: err.message };
    }
  };
  const handleStudentCreated = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    setShowModal(false);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${Base_Api}/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${Base_Api}/api/program/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${Base_Api}/api/program/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${Base_Api}/api/program/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([studentRes, batchRes, groupRes, courseRes]) => {
        const studentData = await studentRes.json();
        const batchData = await batchRes.json();
        const groupData = await groupRes.json();
        const courseData = await courseRes.json();
        setStudents(studentData.data.students);
        setBatches(batchData.data.batches);
        setGroups(groupData.data.groups);
        setCourses(courseData.data.courses);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const BatcheMap = Object.fromEntries(batches.map((b) => [b.id, b.name]));
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
  const groupMap = Object.fromEntries(groups.map((g) => [g.id, g.name]));

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchBatch =
      filters.batch === "all" ||
      String(student.batchId) === String(filters.batch);
    const matchCourse =
      filters.course === "all" ||
      String(student.courseId) === String(filters.course);
    const matchGroup =
      filters.group === "all" ||
      String(student.groupId) === String(filters.group);
    // ✅ Fix — map "active"/"inactive" to the actual isActive boolean
    const matchStatus =
      filters.status === "all" ||
      (filters.status === "active" && student.isActive === true) ||
      (filters.status === "inactive" && student.isActive === false);
    return (
      matchSearch && matchBatch && matchCourse && matchGroup && matchStatus
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-[22px] font-medium">Students</h3>
          <p className="text-xs">
            Search, filter, and manage every student in program
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2563EB] px-3.5 py-2 rounded cursor-pointer text-white"
          >
            + Add Student
          </button>
        </div>
        {showModal && (
          <AddStudent
            onClose={() => setShowModal(false)}
            onCreated={handleStudentCreated}
          />
        )}
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 flex flex-wrap gap-2 items-center border border-gray-200 rounded-lg mx-4 mb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-7 pr-3 py-1.5 border border-gray-300 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.batch}
          onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.group}
          onChange={(e) => setFilters({ ...filters, group: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <RenderStudentList
          students={filteredStudents}
          BatcheMap={BatcheMap}
          courseMap={courseMap}
          groupMap={groupMap}
          onDeleteStudent={handleDeleteStudent}
          onEditStudent={(student) => setEditingStudent(student)}
        />
        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onSave={handleUpdateStudent}
          />
        )}
      </div>
    </>
  );
}

export default AllStudents;
