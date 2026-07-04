// src/component/Attandence/index.jsx
import React, { useState, useEffect, useMemo } from "react";
import MarkAttendence from "./MarkAttendence";
import FilterBar from "../elements/FilterBar";
import { toOptions } from "../elements/toOptions";
import { MONTH_OPTIONS, getYearOptions } from "../AllReports/Constants/date";
import { useProgramStructure } from "../AllReports/hooks/useProgramStructure";
import AttandenceTable from "./AttandenceTable";

const Base_Api = "http://localhost:3000";

function Attandence() {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const {
    batches,
    courses,
    groups,
    loading: structureLoading,
  } = useProgramStructure();
  const [filters, setFilters] = useState({
    batch: "all",
    course: "all",
    group: "all",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(null); // NEW: surface real errors

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch students once
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${Base_Api}/api/students`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load students (${res.status})`);
        const data = await res.json();
        // Defensive: handle both `data.data.students` and `data.students`
        const list = data?.data?.students ?? data?.students ?? [];
        setStudents(list);
      })
      .catch((err) =>
        console.error("[Attendance] students fetch failed:", err),
      );
  }, []);

  const fetchAttendance = () => {
    const token = localStorage.getItem("token");
    setTableLoading(true);
    setAttendanceError(null);

    const params = new URLSearchParams();
    params.append("month", filters.month);
    params.append("year", filters.year);
    if (filters.batch !== "all") params.append("batchId", filters.batch);
    if (filters.course !== "all") params.append("courseId", filters.course);
    if (filters.group !== "all") params.append("groupId", filters.group);

    fetch(`${Base_Api}/api/attendance?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load attendance (${res.status})`);
        }
        const data = await res.json();
        // Defensive: handle both nested `data.data.attendance` and flat `data.attendance`
        const list = data?.data?.attendance ?? data?.attendance ?? [];
        if (!Array.isArray(list)) {
          console.warn("[Attendance] Unexpected response shape:", data);
          setAttendance([]);
          setAttendanceError("Unexpected response format from server.");
          return;
        }
        setAttendance(list);
      })
      .catch((err) => {
        console.error("[Attendance] attendance fetch failed:", err);
        setAttendance([]);
        setAttendanceError(err.message || "Failed to load attendance.");
      })
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.month,
    filters.year,
    filters.batch,
    filters.course,
    filters.group,
  ]);

  // Helper: normalize studentId whether it's a raw string/ObjectId or a populated object
  const resolveStudentId = (entry) => {
    if (entry.studentId && typeof entry.studentId === "object") {
      return entry.studentId._id ?? entry.studentId.id;
    }
    return entry.studentId ?? entry._id;
  };
  console.log("sample attendance entry:", attendance[0]);
  console.log("sample student:", students[0]);
  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s._id ?? s.id, s])),
    [students],
  );

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  const records = useMemo(
    () =>
      attendance.map((entry) => {
        const student = studentMap[entry.studentId ?? entry._id];
        return {
          id: entry._id ?? entry.id,
          studentId: entry.studentId ?? entry._id, // NEW — needed for edit submit
          name: student?.name || "Unknown Student",
          avatar: student?.avatar ?? null,
          groupId: student?.groupId ?? student?.group,
          date: entry.date,
          status: entry.status,
          markedAs: entry.isManual ? "Manual" : "Automatic",
        };
      }),
    [attendance, studentMap],
  );

  const attendanceFilterFields = [
    {
      type: "select",
      key: "batch",
      placeholder: "All batches",
      width: 160,
      options: [{ label: "All batches", value: "all" }, ...toOptions(batches)],
    },
    {
      type: "select",
      key: "course",
      placeholder: "All courses",
      width: 160,
      options: [{ label: "All courses", value: "all" }, ...toOptions(courses)],
    },
    {
      type: "select",
      key: "group",
      placeholder: "All groups",
      width: 160,
      options: [{ label: "All groups", value: "all" }, ...toOptions(groups)],
    },
    {
      type: "select",
      key: "month",
      placeholder: "Month",
      width: 140,
      options: MONTH_OPTIONS,
    },
    {
      type: "select",
      key: "year",
      placeholder: "Year",
      width: 110,
      options: getYearOptions(),
    },
  ];

  return (
    <>
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-[22px] font-medium">Attendance</h3>
          <p className="text-xs">Track and manage student daily attendance.</p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2563EB] px-3.5 py-2 rounded cursor-pointer text-white"
          >
            + Mark Attendance
          </button>
        </div>
        {showModal && (
          <MarkAttendence
            onClose={() => setShowModal(false)}
            onSuccess={fetchAttendance}
          />
        )}
      </div>
      {editingRecord && (
        <MarkAttendence
          editRecord={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={fetchAttendance}
        />
      )}
      <div className="px-4">
        {structureLoading ? (
          <div className="bg-white border rounded-xl p-4 mb-5 text-sm text-gray-500">
            Loading filters...
          </div>
        ) : (
          <FilterBar
            values={filters}
            onChange={handleFilterChange}
            fields={attendanceFilterFields}
          />
        )}
      </div>

      {/* NEW: surface real errors instead of silently showing an empty table */}
      {attendanceError && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {attendanceError}
        </div>
      )}

      <AttandenceTable
        records={records}
        groupMap={groupMap}
        loading={tableLoading}
        onEditAttendance={(record) => setEditingRecord(record)}
      />
    </>
  );
}

export default Attandence;
