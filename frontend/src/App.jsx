import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import MainLayout from './components/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AccessDenied from './pages/AccessDenied';

// Admin Pages
import Admissions from './pages/Admissions';
import FeeManager from './pages/FeeManager';
import CollectFees from './pages/CollectFees';
import SubjectManager from './pages/SubjectManager';
import NoticeManager from './pages/NoticeManager';
import StaffManager from './pages/StaffManager'; // 👈 1. IMPORT ADDED HERE

// Shared Pages
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import TakeAttendance from './pages/TakeAttendance';
import AttendanceReport from './pages/AttendanceReport';
import Profile from './pages/Profile';

// Teacher Pages
import ExamPortal from './pages/ExamPortal';
import MarksEntry from './pages/MarksEntry';
import RoutineManager from './pages/RoutineManager'; 
import MyRoutine from './pages/MyRoutine';

// Student Pages
import LiveResult from './pages/LiveResult';
import FinalResult from './pages/FinalResult';
import MyFees from './pages/MyFees';
import MyAttendance from './pages/MyAttendance';
import StudentRoutine from './pages/StudentRoutine';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Protected Main Layout Wrapper */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

            <Route path="/dashboard" element={<Dashboard />} />

            {/* --- ADMIN ROUTES --- */}
            {/* 2. ROUTE ADDED HERE 👇 */}
            <Route path="/staff" element={<RoleRoute allowedRoles={['ADMIN']}><StaffManager /></RoleRoute>} />
            
            <Route path="/admissions" element={<RoleRoute allowedRoles={['ADMIN']}><Admissions /></RoleRoute>} />
            <Route path="/fees" element={<RoleRoute allowedRoles={['ADMIN']}><FeeManager /></RoleRoute>} />
            <Route path="/fees/collect" element={<RoleRoute allowedRoles={['ADMIN']}><CollectFees /></RoleRoute>} />
            <Route path="/subjects" element={<RoleRoute allowedRoles={['ADMIN']}><SubjectManager /></RoleRoute>} />
            <Route path="/notices" element={<RoleRoute allowedRoles={['ADMIN']}><NoticeManager /></RoleRoute>} />
            <Route path="/routine/manage" element={<RoleRoute allowedRoles={['ADMIN']}><RoutineManager /></RoleRoute>} />

            {/* --- TEACHER ROUTES --- */}
            <Route path="/my-routine" element={<RoleRoute allowedRoles={['TEACHER']}><MyRoutine /></RoleRoute>} />
            <Route path="/teacher/exams/:subjectClassId" element={<RoleRoute allowedRoles={['TEACHER']}><ExamPortal /></RoleRoute>} />
            {/* Marks can be entered by Teacher OR Admin (if needed) */}
            <Route path="/teacher/marks/:assessmentId" element={<RoleRoute allowedRoles={['TEACHER', 'ADMIN']}><MarksEntry /></RoleRoute>} />

            {/* --- STUDENT ROUTES --- */}
            <Route path="/live-result" element={<RoleRoute allowedRoles={['STUDENT']}><LiveResult /></RoleRoute>} />
            <Route path="/final-result" element={<RoleRoute allowedRoles={['STUDENT']}><FinalResult /></RoleRoute>} />
            <Route path="/my-fees" element={<RoleRoute allowedRoles={['STUDENT']}><MyFees /></RoleRoute>} />
            <Route path="/my-attendance" element={<RoleRoute allowedRoles={['STUDENT']}><MyAttendance /></RoleRoute>} />
            <Route path="/student-routine" element={<RoleRoute allowedRoles={['STUDENT']}><StudentRoutine /></RoleRoute>} />

            {/* --- SHARED ROUTES --- */}
            {/* Both Admin and Teacher can see students and attendance reports */}
            <Route path="/students" element={<RoleRoute allowedRoles={['ADMIN', 'TEACHER']}><StudentList /></RoleRoute>} />
            <Route path="/students/:id" element={<RoleRoute allowedRoles={['ADMIN', 'TEACHER']}><StudentProfile /></RoleRoute>} />
            <Route path="/attendance" element={<RoleRoute allowedRoles={['ADMIN', 'TEACHER']}><TakeAttendance /></RoleRoute>} />
            <Route path="/attendance/report" element={<RoleRoute allowedRoles={['ADMIN', 'TEACHER']}><AttendanceReport /></RoleRoute>} />
            
            <Route path="/profile" element={<Profile />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;