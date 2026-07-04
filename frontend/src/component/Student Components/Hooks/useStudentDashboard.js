// hooks/useStudentDashboard.js
import { useState, useEffect } from "react";

const MOCK_DASHBOARD = {
  student: {
    name: "Mika Sato",
    initials: "MS",
  },
  latestApprovedReport: {
    title: "Authentication flow",
    score: 4,
    maxScore: 5,
    rating: 2,
    maxRating: 5,
    status: "Approved",
    feedback: "Clear write-up with concrete examples. Keep going at this pace.",
  },
  thisWeek: {
    dateRange: "Jun 21, 2026 – Jun 27, 2026",
    reportsSubmitted: 1,
    onTime: 1,
    late: 0,
    approved: 1,
    studyHours: null,
    completionRate: 20.0,
  },
  thisMonth: {
    label: "May 2026",
    submitted: 2,
    completion: 9.5,
    avgScore: 4.5,
    maxScore: 5,
    avgRating: 3.5,
    maxRating: 5,
  },
  attendanceThisMonth: {
    label: "June 2026",
    present: 7,
    late: 2,
    absent: 7,
  },
  recentReports: [
    {
      id: 1,
      date: "Jun 23, 2026",
      title: "Authentication flow",
      status: "Approved",
      isLate: false,
      rating: 2,
      maxRating: 5,
      score: 4,
      maxScore: 5,
    },
    {
      id: 2,
      date: "Jun 16, 2026",
      title: "UI components",
      status: "Needs Revision",
      isLate: true,
      rating: 5,
      maxRating: 5,
      score: 5,
      maxScore: 5,
    },
  ],
  latestFeedback: {
    date: "Jun 23, 2026",
    comment: "Clear write-up with concrete examples. Keep going at this pace.",
  },
  submissionDeadline: "23:00",
};

export function useStudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with real API call
    // const token = localStorage.getItem("token");
    // fetch("http://localhost:3000/api/student/dashboard", {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    //   .then((r) => r.json())
    //   .then((res) => setData(res.data))
    //   .catch((err) => setError(err.message))
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      setData(MOCK_DASHBOARD);
      setLoading(false);
    }, 600);
  }, []);

  return { data, loading, error };
}
