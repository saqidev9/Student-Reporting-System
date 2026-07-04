import { useState, useMemo, useCallback } from "react";
import { INITIAL_FILTERS } from "../constants";

// Tab key → status values it should show
const TAB_STATUS_MAP = {
  1: null, // All — no tab filter
  2: ["pending"], // Pending Review
  3: ["needs_revision", "rejected"], // Needs Attention
};

export function useReportsFilter(reports = [], activeTab = "1") {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeStatus, setActiveStatus] = useState(null);

  const handleChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset status pill when filters change
    if (key !== "status") setActiveStatus(null);
  }, []);

  const tabFilteredReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];

    const tabStatuses = TAB_STATUS_MAP[activeTab];

    return reports.filter((r) => {
      // ── Tab filter ──────────────────────────────────────────────
      if (tabStatuses && !tabStatuses.includes(r.status)) return false;

      // ── Status pill click ────────────────────────────────────────
      if (activeStatus && r.status !== activeStatus) return false;

      // ── Search ──────────────────────────────────────────────────
      if (filters.search) {
        const name = r.student?.name?.toLowerCase() ?? "";
        if (!name.includes(filters.search.toLowerCase())) return false;
      }

      // ── Batch ───────────────────────────────────────────────────
      if (filters.batch && r.student?.batchId !== filters.batch) return false;

      // ── Course ──────────────────────────────────────────────────
      if (filters.course && r.student?.courseId !== filters.course)
        return false;

      // ── Group ───────────────────────────────────────────────────
      if (filters.group && r.student?.groupId !== filters.group) return false;

      // ── Status dropdown ─────────────────────────────────────────
      if (filters.status && r.status !== filters.status) return false;

      // ── Submission (isLate flag) ─────────────────────────────────
      if (filters.submission) {
        if (filters.submission === "late" && !r.isLate) return false;
        if (filters.submission === "on_time" && r.isLate) return false;
        if (filters.submission === "missing" && r.submittedAt) return false;
      }

      // ── Date range ───────────────────────────────────────────────
      if (filters.dateFrom) {
        if (
          !r.reportDate ||
          new Date(r.reportDate) < new Date(filters.dateFrom)
        )
          return false;
      }
      if (filters.dateTo) {
        if (!r.reportDate || new Date(r.reportDate) > new Date(filters.dateTo))
          return false;
      }

      // ── Score range ──────────────────────────────────────────────
      const score = r.evaluation?.score;
      if (
        filters.scoreMin !== "" &&
        (score === undefined || score < Number(filters.scoreMin))
      )
        return false;
      if (
        filters.scoreMax !== "" &&
        (score === undefined || score > Number(filters.scoreMax))
      )
        return false;

      return true;
    });
  }, [reports, activeTab, filters, activeStatus]);

  return {
    filters,
    activeStatus,
    handleChange,
    setActiveStatus,
    tabFilteredReports,
  };
}
