import { useState, useEffect } from "react";

export function UseGroupData() {
  const [groupMap, setGroupMap] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:3000/api/program/groups", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        const groups = result?.data?.groups ?? result?.data ?? [];

        const map = {};

        groups.forEach((g) => {
          map[g.id ?? g._id] = g.name;
        });

        setGroupMap(map);
      } catch (error) {
        console.error("Failed to Fetch", error.message);
      }
    };

    fetchGroups();
  }, []);

  return groupMap;
}
