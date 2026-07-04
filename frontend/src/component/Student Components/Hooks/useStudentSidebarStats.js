// hooks/useStudentSidebarStats.js
import { useState, useEffect } from "react";

const MOCK_STATS = {
  pendingReportsCount: 2,
};

export function useStudentSidebarStats() {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // const token = localStorage.getItem("token");
    // fetch("http://localhost:3000/api/student/reports/pending-count", {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    //   .then((r) => r.json())
    //   .then((data) => setPendingReportsCount(data.data?.count ?? 0))
    //   .catch(console.error)
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      setPendingReportsCount(MOCK_STATS.pendingReportsCount);
      setLoading(false);
    }, 300);
  }, []);

  return { pendingReportsCount, loading };
}
