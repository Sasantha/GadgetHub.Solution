// Protected Admin Route - Ensures only authenticated admins can access admin pages
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'manager' | 'super_admin';
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, admin } = useAdmin();
  const location = useLocation();

  // If not authenticated, redirect to admin login
  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const hasRequiredRole = () => {
      switch (requiredRole) {
        case 'super_admin':
          return admin.role === 'super_admin';
        case 'manager':
          return admin.role === 'super_admin' || admin.role === 'manager';
        case 'admin':
          return true; // All authenticated admin users can access admin level
        default:
          return false;
      }
    };

    if (!hasRequiredRole()) {
      return (
        <div className="admin-access-denied">
          <div className="access-denied-content">
            <h2>🚫 Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <p>Required role: <strong>{requiredRole}</strong></p>
            <p>Your role: <strong>{admin.role}</strong></p>
            <button onClick={() => window.history.back()}>
              ← Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute; 