import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // 1. If not logged in at all -> Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in, but role is wrong -> Access Denied
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  // 3. If role matches -> Show the Page
  return children;
};

export default RoleRoute;