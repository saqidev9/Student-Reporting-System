import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:3000/api";

export function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/tags`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to fetch tags");
      setTags(json.data.tags);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(
    async (name) => {
      const res = await fetch(`${BASE_URL}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to create tag");
      await fetchTags(); // refetch to get updated list
      return json.data;
    },
    [fetchTags],
  );

  const assignStudent = useCallback(async (tagId, studentId) => {
    const res = await fetch(`${BASE_URL}/tags/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tagId, studentId }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Failed to assign student");
    return json.data;
  }, []);

  const removeStudentFromTag = useCallback(async (tagId, studentId) => {
    const res = await fetch(`${BASE_URL}/tags/${tagId}/students/${studentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Failed to remove student");
    return json.data;
  }, []);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    assignStudent,
    removeStudentFromTag,
  };
}
