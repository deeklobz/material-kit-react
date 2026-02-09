import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/context/AuthContext';

// ----------------------------------------------------------------------

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
