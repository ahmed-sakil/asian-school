import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Traffic Controller Logic 🚦
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    default:
      return <div>Unknown Role</div>;
  }
};

export default Dashboard;