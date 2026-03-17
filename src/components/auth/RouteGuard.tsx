import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  /** If set, user must have one of these roles */
  allowedRoles?: ('admin' | 'team' | 'client')[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { session, loading, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = roles.some((r) => allowedRoles.includes(r));
    if (!hasAccess) {
      // Client trying to access admin area → portal, admin/team trying portal → home
      const redirect = roles.includes('client') ? '/portal' : '/';
      return <Navigate to={redirect} replace />;
    }
  }

  return <>{children}</>;
}
