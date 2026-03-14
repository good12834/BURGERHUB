import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
 const { isAuthenticated, user } = useAuth();
 const location = useLocation();

 if (!isAuthenticated) {
  return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
 }

 if (adminOnly && user?.role !== 'admin') {
  return <Navigate to="/" replace />;
 }

 return children;
};
export default ProtectedRoute;
