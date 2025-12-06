import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. If we are still checking if the user is logged in, show a spinner
  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
  }

  // 2. If check is done and NO user, kick them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists, let them see the page
  return children;
};

export default ProtectedRoute;