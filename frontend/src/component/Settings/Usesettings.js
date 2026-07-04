import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/settings`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to fetch settings");
      setSettings(json.data.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // submissionDeadline expected as "HH:mm" (24-hour), e.g. "23:00"
  const updateDeadline = useCallback(
    async (submissionDeadline) => {
      const res = await fetch(`${BASE_URL}/settings/deadline`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ submissionDeadline }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to update deadline");
      // Backend may return the updated settings object directly, or nested under data.settings
      const updated = json.data?.settings || json.data || null;
      if (updated) {
        setSettings(updated);
      } else {
        await fetchSettings(); // fallback: refetch if shape is unexpected
      }
      return updated;
    },
    [fetchSettings],
  );

  return { settings, loading, error, refetch: fetchSettings, updateDeadline };
}
