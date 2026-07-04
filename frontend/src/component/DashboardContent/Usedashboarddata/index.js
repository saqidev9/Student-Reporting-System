import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function useDashboardData() {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();

      const [reportsRes, studentsRes, groupsRes, settingsRes] =
        await Promise.all([
          fetch(`${BASE_URL}/reports`, { headers }),
          fetch(`${BASE_URL}/students`, { headers }),
          fetch(`${BASE_URL}/program/groups`, { headers }),
          fetch(`${BASE_URL}/settings`, { headers }),
        ]);

      const [reportsJson, studentsJson, groupsJson, settingsJson] =
        await Promise.all([
          reportsRes.json(),
          studentsRes.json(),
          groupsRes.json(),
          settingsRes.json(),
        ]);

      if (!reportsJson.success)
        throw new Error(reportsJson.message || "Failed to fetch reports");
      if (!studentsJson.success)
        throw new Error(studentsJson.message || "Failed to fetch students");
      if (!groupsJson.success)
        throw new Error(groupsJson.message || "Failed to fetch groups");
      if (!settingsJson.success)
        throw new Error(settingsJson.message || "Failed to fetch settings");

      setReports(reportsJson.data.reports || []);
      setStudents(studentsJson.data.students || []);
      setGroups(groupsJson.data.groups || []);
      setSettings(settingsJson.data.settings || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    reports,
    students,
    groups,
    settings,
    loading,
    error,
    refetch: fetchAll,
  };
}
