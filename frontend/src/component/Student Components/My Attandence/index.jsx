// component/Student Components/MyAttendance.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  FiCheckSquare,
  FiX,
  FiClock,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
} from "react-icons/fi";

const STATUS = {
  present: {
    label: "PRESENT",
    icon: FiCheckSquare,
    cell: "bg-green-50 border-green-100",
    text: "text-green-600",
    pill: "bg-green-50 text-green-600 border border-green-200",
    pillLabel: "Present",
    pillIcon: FiCheckSquare,
  },
  late: {
    label: "LATE",
    icon: FiClock,
    cell: "bg-yellow-50 border-yellow-100",
    text: "text-yellow-600",
    pill: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    pillLabel: "Late",
    pillIcon: FiClock,
  },
  absent: {
    label: "ABSENT",
    icon: FiX,
    cell: "bg-red-50 border-red-100",
    text: "text-red-500",
    pill: "bg-red-50 text-red-500 border border-red-200",
    pillLabel: "Absent",
    pillIcon: FiX,
  },
  norecord: {
    label: "",
    icon: null,
    cell: "bg-white border-gray-100",
    text: "text-gray-300",
    pill: "bg-white text-gray-500 border border-gray-200",
    pillLabel: "No record",
    pillIcon: FiBell,
  },
};

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  const jsDay = new Date(year, month, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function SummaryPill({ statusKey, count }) {
  const cfg = STATUS[statusKey];
  const Icon = cfg.pillIcon;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${cfg.pill}`}
    >
      <Icon size={13} />
      <span>{cfg.pillLabel}</span>
      <span className="font-bold">{count}</span>
      <span className="font-normal text-xs opacity-70">days</span>
    </div>
  );
}

function DayCell({ day, statusKey, isToday, isSunday, isFaded }) {
  if (!day) {
    return (
      <div className="border border-gray-100 rounded-xl bg-white min-h-[80px]" />
    );
  }

  if (isSunday) {
    return (
      <div
        className={`border border-gray-100 rounded-xl min-h-[80px] p-2 bg-gray-50 flex flex-col justify-between ${
          isFaded ? "opacity-40" : ""
        }`}
      >
        <span className="text-sm font-semibold text-gray-400">{day}</span>
        <div className="flex items-center gap-1 text-gray-300">
          <FiSun size={11} />
          <span className="text-[10px] font-bold tracking-wide">LEAVE</span>
        </div>
      </div>
    );
  }

  const cfg = STATUS[statusKey] || STATUS.norecord;
  const Icon = cfg.icon;

  return (
    <div
      className={`border rounded-xl min-h-[80px] p-2 flex flex-col justify-between transition-all
      ${cfg.cell}
      ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
      ${isFaded ? "opacity-40" : ""}
    `}
    >
      <span
        className={`text-sm font-semibold ${
          isFaded ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {day}
      </span>

      {statusKey !== "norecord" && Icon && (
        <div className={`flex items-center gap-1 ${cfg.text}`}>
          <Icon size={12} />
          <span className="text-[10px] font-bold tracking-wide">
            {cfg.label}
          </span>
        </div>
      )}
    </div>
  );
}

function MyAttendance() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/attendance/my", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const json = await res.json();

        console.log("API RESPONSE:", json);

        const map = {};

        (json.data?.attendance ?? []).forEach((record) => {
          const date = record.date;
          const status = record.status?.toLowerCase().trim(); // 🔥 FIXED

          map[date] = status;
        });

        setAttendanceMap(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  const { cells, counts } = useMemo(() => {
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const firstWeekday = getFirstDayOfWeek(viewYear, viewMonth);

    const counts = { present: 0, late: 0, absent: 0, norecord: 0 };

    const cells = Array(firstWeekday).fill(null);

    for (let d = 1; d <= totalDays; d++) {
      const isSunday = new Date(viewYear, viewMonth, d).getDay() === 0;

      let statusKey = "norecord";

      if (!isSunday) {
        const key = toKey(viewYear, viewMonth, d);
        statusKey = attendanceMap[key] || "norecord";
      }

      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      } else {
        counts.norecord++;
      }

      cells.push({ day: d, statusKey, isSunday });
    }

    return { cells, counts };
  }, [viewYear, viewMonth, attendanceMap]);

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const remainder = cells.length % 7;

  const padded = [
    ...cells,
    ...Array(remainder === 0 ? 0 : 7 - remainder).fill(null),
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-400 mt-1">Your daily attendance log.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            <FiChevronLeft size={14} /> Previous
          </button>

          <h2 className="text-base font-bold text-gray-800">
            {formatMonthYear(viewYear, viewMonth)}
          </h2>

          <button
            onClick={nextMonth}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Next <FiChevronRight size={14} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-400 py-10">Loading...</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-500 bg-red-50 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Summary */}
            <div className="flex gap-2 flex-wrap mb-6">
              <SummaryPill statusKey="present" count={counts.present} />
              <SummaryPill statusKey="late" count={counts.late} />
              <SummaryPill statusKey="absent" count={counts.absent} />
              <SummaryPill statusKey="norecord" count={counts.norecord} />
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
              {padded.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={idx}
                      className="border border-gray-100 rounded-xl min-h-[80px]"
                    />
                  );
                }

                const isToday = isCurrentMonth && cell.day === today.getDate();

                const isFuture = isCurrentMonth && cell.day > today.getDate();

                return (
                  <DayCell
                    key={`${cell.day}-${idx}`}
                    day={cell.day}
                    statusKey={cell.statusKey}
                    isToday={isToday}
                    isSunday={cell.isSunday}
                    isFaded={isFuture}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyAttendance;
