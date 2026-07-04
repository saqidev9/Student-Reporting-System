import { useState, useEffect } from "react";

export function useReportsData() {
  const [reports, setReports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      setLoading(true);
      setError(null);

      try {
        const [reportsRes, batchRes, courseRes, groupRes] = await Promise.all([
          fetch("http://localhost:3000/api/reports", { headers }),
          fetch("http://localhost:3000/api/program/batches", { headers }),
          fetch("http://localhost:3000/api/program/courses", { headers }),
          fetch("http://localhost:3000/api/program/groups", { headers }),
        ]);

        const [reportsJson, batchJson, courseJson, groupJson] =
          await Promise.all([
            reportsRes.json(),
            batchRes.json(),
            courseRes.json(),
            groupRes.json(),
          ]);

        setReports(
          Array.isArray(reportsJson?.data?.reports)
            ? reportsJson.data.reports
            : [],
        );
        setBatches(batchJson?.data?.batches ?? []);
        setCourses(courseJson?.data?.courses ?? []);
        setGroups(groupJson?.data?.groups ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { reports, batches, courses, groups, loading, error };
}
