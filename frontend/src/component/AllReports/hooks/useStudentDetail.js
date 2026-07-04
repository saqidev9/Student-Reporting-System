import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:3000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function summarizeAttendance(attendanceRecords, studentId) {
  const monthKey = getCurrentMonthKey();
  const counts = { present: 0, absent: 0, late: 0 };

  attendanceRecords
    .filter(
      (record) =>
        record.studentId === studentId && record.date?.startsWith(monthKey),
    )
    .forEach((record) => {
      if (counts[record.status] !== undefined) {
        counts[record.status] += 1;
      }
    });

  return counts;
}

export function useStudentDetail(studentId) {
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const [
        studentRes,
        reportsRes,
        attendanceRes,
        batchRes,
        courseRes,
        groupRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/api/students/${studentId}`, {
          headers: authHeader(),
        }),
        fetch(`${API_BASE}/api/reports?studentId=${studentId}&limit=5`, {
          headers: authHeader(),
        }),
        fetch(`${API_BASE}/api/attendance?studentId=${studentId}`, {
          headers: authHeader(),
        }),
        fetch(`${API_BASE}/api/program/batches`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/program/courses`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/program/groups`, { headers: authHeader() }),
      ]);

      if (!studentRes.ok) throw new Error("Student not found");

      const studentData = await studentRes.json();
      const reportsData = reportsRes.ok
        ? await reportsRes.json()
        : { data: { reports: [] } };
      const attendanceData = attendanceRes.ok
        ? await attendanceRes.json()
        : { data: { attendance: [] } };
      const batchData = batchRes.ok
        ? await batchRes.json()
        : { data: { batches: [] } };
      const courseData = courseRes.ok
        ? await courseRes.json()
        : { data: { courses: [] } };
      const groupData = groupRes.ok
        ? await groupRes.json()
        : { data: { groups: [] } };

      const fetchedStudent = studentData.data.student;

      // Reports endpoint may or may not honor ?studentId= server-side.
      // Filter + sort client-side so the UI is correct either way, then
      // take the latest 5 by reportDate.
      const allReports = reportsData.data.reports ?? [];
      const studentReports = allReports
        .filter((report) => report.studentId === studentId)
        .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
        .slice(0, 5);

      const allAttendance = attendanceData.data.attendance ?? [];
      const summary = summarizeAttendance(allAttendance, studentId);

      setStudent(fetchedStudent);
      setReports(studentReports);
      setAttendanceSummary(summary);
      setBatches(batchData.data.batches ?? []);
      setCourses(courseData.data.courses ?? []);
      setGroups(groupData.data.groups ?? []);
    } catch (err) {
      console.error("Failed to load student detail:", err);
      setError(err.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggleStatus = useCallback(async () => {
    if (!student) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/students/${student.id}/toggle-status`,
        {
          method: "PATCH",
          headers: authHeader(),
        },
      );
      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      const updated = data.data?.student;
      setStudent((prev) => ({
        ...prev,
        isActive: updated ? updated.isActive : !prev.isActive,
      }));
      return { success: true };
    } catch (err) {
      console.error("Toggle status failed:", err);
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [student]);

  const updateStudent = useCallback(
    async (payload) => {
      if (!student) return { success: false };
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/students/${student.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? "Failed to update student");
        setStudent((prev) => ({ ...prev, ...(data.data?.student ?? payload) }));
        return { success: true };
      } catch (err) {
        console.error("Update student failed:", err);
        return { success: false, message: err.message };
      } finally {
        setActionLoading(false);
      }
    },
    [student],
  );
  const assignTag = useCallback(
    async (tag) => {
      if (!student) return { success: false };
      const tagId = tag.id;
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/tags/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({ studentId: student.id, tagId }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message ?? "Failed to assign tag");
        // Don't trust the backend's response shape here — the assign
        // endpoint may only return the join record, not the full tag with
        // a name. We already have the correct, complete tag object from
        // TagPicker, so just use that directly.
        setStudent((prev) => {
          if (!prev) return prev;
          const alreadyHas = prev.tags?.some((t) => t.id === tagId);
          if (alreadyHas) return prev;
          return { ...prev, tags: [...(prev.tags ?? []), tag] };
        });
        return { success: true };
      } catch (err) {
        console.error("Assign tag failed:", err);
        return { success: false, message: err.message };
      } finally {
        setActionLoading(false);
      }
    },
    [student],
  );
  const removeTag = useCallback(
    async (tagId) => {
      if (!student) return { success: false };
      setActionLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/tags/assign/${student.id}/${tagId}`,
          {
            method: "DELETE",
            headers: authHeader(),
          },
        );
        if (!response.ok) throw new Error("Failed to remove tag");
        setStudent((prev) => ({
          ...prev,
          tags: prev.tags?.filter((t) => t.id !== tagId) ?? [],
        }));
        return { success: true };
      } catch (err) {
        console.error("Remove tag failed:", err);
        return { success: false, message: err.message };
      } finally {
        setActionLoading(false);
      }
    },
    [student],
  );

  return {
    student,
    reports,
    attendanceSummary,
    batches,
    courses,
    groups,
    loading,
    error,
    actionLoading,
    toggleStatus,
    updateStudent,
    assignTag,
    removeTag,
    refetch: fetchAll,
  };
}
