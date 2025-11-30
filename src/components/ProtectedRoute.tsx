import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './layout/Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth state to be determined before redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role-based access control
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Auto-redirect based on role if accessing generic routes
  if (location.pathname === '/dashboard' && user?.role) {
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      {user?.role !== 'hod' && <Header />}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
};

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'faculty':
      return '/faculty-dashboard';
    case 'hod':
      return '/hod-workspace';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/dashboard';
  }
}

export default ProtectedRoute;
