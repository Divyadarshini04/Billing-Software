import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { useSubscription } from "../context/SubscriptionContext";

export default function ProtectedRoute({ element, requiredRole = null, requiredPermission = null }) {
  const { isAuthenticated, userRole, loading, user } = useAuth();
  const { hasPermission } = usePermissions();
  const { getSubscriptionStatus } = useSubscription();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutExceeded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Wait for auth to load before redirecting
  if (loading && !timeoutExceeded && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light via-blue-50 to-light dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn("DEBUG: ProtectedRoute - Not Authenticated. Redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Super Admin bypass for any permission requirement
  if (user?.is_super_admin) {
    return element;
  }

  // Owner role bypass removed - strict permission check applied via hasPermission below

  if (requiredRole) {
    const roleMatch = userRole && userRole.toUpperCase() === requiredRole.toUpperCase();
    console.log(`DEBUG: ProtectedRoute Role Check [${window.location.pathname}]. Required: ${requiredRole}, Has: ${userRole}, Match: ${roleMatch}`);

    if (!roleMatch) {
      console.warn(`DEBUG: ProtectedRoute Blocking [${window.location.pathname}] - Role Mismatch. Redirecting to /`);
      return <Navigate to="/" replace />;
    }
  }

  // Check permission if required
  if (requiredPermission) {
    const permMatch = hasPermission(userRole, requiredPermission);
    console.log(`DEBUG: ProtectedRoute Permission Check [${window.location.pathname}]. Required: ${requiredPermission}, Role: ${userRole}, Match: ${permMatch}`);

    // Log why validation failed
    if (!permMatch) {
      console.warn(`DEBUG: ProtectedRoute Blocking - Permission Missing. Role: ${userRole}, Perm: ${requiredPermission}`);
      // Prevent infinite loop if we are already at root
      if (window.location.pathname === "/" || window.location.pathname === "") {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">You do not have permission to view the Dashboard.</p>
              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mb-4 text-left">
                <p><strong>Current Role:</strong> {userRole}</p>
                <p><strong>Required Perm:</strong> {requiredPermission}</p>
                <p><strong>Status:</strong> Denied</p>
              </div>
              <button onClick={() => window.location.href = "/login"} className="mt-4 text-blue-600 underline">Back to Login</button>
            </div>
          </div>
        );
      }
      return <Navigate to="/" replace />;
    }
  }

  // Final check: if subscription is expired, block core features
  const subStatus = getSubscriptionStatus(userRole === 'SALES_EXECUTIVE' ? 'SALES_EXECUTIVE' : 'OWNER');
  const restrictedPermissions = ['pos_access', 'view_reports', 'manage_inventory', 'manage_staff', 'view_dashboard_stats'];

  if (subStatus.status === 'EXPIRED' && requiredPermission && restrictedPermissions.includes(requiredPermission)) {
    console.warn(`DEBUG: ProtectedRoute Blocking - Subscription Expired. Role: ${userRole}, Perm: ${requiredPermission}`);
    // Redirect to a specific path (like dashboard) where the overlay is shown
    // or if they are already on dashboard, let it render so overlay shows.
    if (window.location.pathname !== "/dashboard" && window.location.pathname !== "/") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
}
