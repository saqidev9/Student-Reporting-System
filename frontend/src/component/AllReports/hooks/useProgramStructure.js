// src/component/AllReports/hooks/useProgramStructure.js

import { useEffect, useState } from "react";

const Base_Api = "http://localhost:3000";

export function useProgramStructure() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${Base_Api}/api/program/batches`, { headers }),
      fetch(`${Base_Api}/api/program/courses`, { headers }),
      fetch(`${Base_Api}/api/program/groups`, { headers }),
    ])
      .then(async ([bR, cR, gR]) => {
        // FIX: Promise.all returns plain Response objects, not {status, value} wrappers.
        // Parse them directly — no allSettled wrapping needed here.
        const [bd, cd, gd] = await Promise.all([
          bR.ok ? bR.json() : null,
          cR.ok ? cR.json() : null,
          gR.ok ? gR.json() : null,
        ]);

        if (bd) setBatches(bd.data?.batches ?? []);
        if (cd) setCourses(cd.data?.courses ?? []);
        if (gd) setGroups(gd.data?.groups ?? []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { batches, courses, groups, loading, error };
}

export default useProgramStructure;
