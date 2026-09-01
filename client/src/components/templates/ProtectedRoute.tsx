import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDashboardPathForRole } from '@/lib/routeResolver';
import { Button } from '@/components/atoms/Button';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectPath = '/portals',
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => user.role?.startsWith(role) || user.role === role);
    if (!hasRole) {
      const myDashboard = getDashboardPathForRole(user.role);
      const userRoleLabel = (user.role || 'customer').replace(/_/g, ' ').toUpperCase();
      const requiredRolesLabel = allowedRoles.map((r) => r.replace(/_/g, ' ').toUpperCase()).join(', ');

      return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Portal Access Restricted</h2>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              You are currently signed in as a <span className="text-emerald-400 font-semibold">{userRoleLabel}</span>. This section requires <span className="text-neutral-200 font-medium">{requiredRolesLabel}</span> permissions.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium flex items-center gap-2"
                onClick={() => navigate(myDashboard)}
              >
                <ArrowLeft className="w-4 h-4" />
                Return to My {userRoleLabel} Portal
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center border-neutral-700 hover:bg-neutral-800 text-neutral-300 py-3 rounded-xl font-medium flex items-center gap-2"
                onClick={() => navigate('/portals')}
              >
                <RefreshCw className="w-4 h-4" />
                Switch Portal / Role
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
