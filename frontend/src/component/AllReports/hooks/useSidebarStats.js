import { useEffect, useState } from "react";

const Base_Api = "http://localhost:3000";

export function useSidebarStats() {
  const [pendingCount, setPendingCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${Base_Api}/api/reports?status=pending`, { headers }).then((r) =>
        r.json(),
      ),
      fetch(`${Base_Api}/api/reports?status=needs_revision`, { headers }).then(
        (r) => r.json(),
      ),
      fetch(`${Base_Api}/api/students?status=active`, { headers }).then((r) =>
        r.json(),
      ),
    ])
      .then(([pendingRes, revisionRes, studentsRes]) => {
        const pending =
          pendingRes?.data?.total ?? pendingRes?.data?.reports?.length ?? 0;
        const revision =
          revisionRes?.data?.total ?? revisionRes?.data?.reports?.length ?? 0;
        const students =
          studentsRes?.data?.total ?? studentsRes?.data?.students?.length ?? 0;

        setPendingCount(pending + revision);
        setStudentCount(students);
      })
      .catch((err) => console.error("Sidebar stats error:", err));
  }, []);

  return { pendingCount, studentCount };
}
