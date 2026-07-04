import { useState, useEffect, useMemo } from "react";

const BASE_URL = "http://localhost:3000/api";

// Fetches all students once — used both for tag student derivation and search dropdown
export function useAllStudents() {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/students`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setAllStudents(json.data.students || []);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { allStudents, loading, refetchStudents: fetchStudents };
}

// Derives students for the selected tag from allStudents locally.
// No extra API call needed — each student already has a `tags` array
// in the GET /api/students response.
export function useTagStudents(selectedTagId, allStudents) {
  const tagStudents = useMemo(() => {
    // Guard: allStudents must be an array and a tag must be selected
    if (
      !selectedTagId ||
      !Array.isArray(allStudents) ||
      allStudents.length === 0
    ) {
      return [];
    }
    return allStudents.filter(
      (student) =>
        Array.isArray(student.tags) &&
        student.tags.some((t) => t.id === selectedTagId),
    );
  }, [selectedTagId, allStudents]);

  return { tagStudents };
}
