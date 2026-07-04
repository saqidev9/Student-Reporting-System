import { useMemo } from "react";

// Returns today's date as YYYY-MM-DD in local time (matches reportDate format assumption)
function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useDashboardStats({ reports, students, groups, settings }) {
  const groupMap = useMemo(
    () => Object.fromEntries((groups || []).map((g) => [g.id, g.name])),
    [groups],
  );

  const pendingCount = useMemo(
    () => (reports || []).filter((r) => r.status === "pending").length,
    [reports],
  );

  const needsRevisionCount = useMemo(
    () => (reports || []).filter((r) => r.status === "needs_revision").length,
    [reports],
  );

  const activeStudentsCount = useMemo(
    () => (students || []).filter((s) => s.isActive).length,
    [students],
  );

  const submissionDeadline = settings?.submissionDeadline || "--:--";

  // Students who have NOT submitted a report today
  const studentsWithoutReportToday = useMemo(() => {
    if (!students?.length) return [];
    const today = getTodayDateString();

    const submittedTodayIds = new Set(
      (reports || [])
        .filter((r) => {
          if (!r.reportDate) return false;
          // Normalize reportDate to YYYY-MM-DD for comparison
          const reportDay = String(r.reportDate).slice(0, 10);
          return reportDay === today;
        })
        .map((r) => r.student?.id || r.studentId),
    );

    return students
      .filter((s) => s.isActive && !submittedTodayIds.has(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        groupName: groupMap[s.groupId] || "—",
      }));
  }, [students, reports, groupMap]);

  return {
    pendingCount,
    needsRevisionCount,
    activeStudentsCount,
    submissionDeadline,
    studentsWithoutReportToday,
  };
}
