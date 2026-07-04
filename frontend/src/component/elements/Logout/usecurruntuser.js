import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:3000/api";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setUser(json.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { user, loading };
}
