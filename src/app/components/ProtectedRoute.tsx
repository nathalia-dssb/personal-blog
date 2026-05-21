import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
}

export function ProtectedRoute({ isLoggedIn }: ProtectedRouteProps) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
