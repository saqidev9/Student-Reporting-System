// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Login/Login";
import ProtectedRoute from "./component/ProtectRout";
import PublicRoute from "./component/PublicRoute";

// Admin layout + pages
import Admin from "./pages/Admin/Admin";
import Content from "./component/DashboardContent";
import AllStudents from "./component/AllStudents";
import StudentDetail from "./component/AllStudents/StudentDetails";
import AddStudent from "./component/AllStudents/AddStudent";
import AllReports from "./component/AllReports";
import ReportDetail from "./component/AllReports/ReportDetail";
import ProgramStructure from "./component/ProgramStructur";
import Tags from "./component/Tags";
import Settings from "./component/Settings";
import Attandence from "./component/Attandence";

// Student layout + pages
import Student from "./pages/student";
import StudentDashboard from "./component/Student Components/StudentDashboard";

import SubmitReport from "./component/Student Components/Submit Report";
import ReportHistory from "./component/Student Components/Report history";
import MyPerformance from "./component/Student Components/My Performence";
import MyAttendance from "./component/Student Components/My Attandence";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Content />} />
          <Route path="all-student" element={<AllStudents />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
          <Route path="all-student/add-student" element={<AddStudent />} />
          <Route path="program-structure" element={<ProgramStructure />} />
          <Route path="All-Reports" element={<AllReports />} />
          <Route path="All-Reports/:reportId" element={<ReportDetail />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="Attendence" element={<Attandence />} />
          <Route path="tags" element={<Tags />} />
        </Route>

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Student />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="submit-report" element={<SubmitReport />} />
          <Route path="report-history" element={<ReportHistory />} />
          <Route path="my-performance" element={<MyPerformance />} />
          <Route path="my-attendance" element={<MyAttendance />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
