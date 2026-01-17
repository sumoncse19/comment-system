import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner spinner--lg"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
