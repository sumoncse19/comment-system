import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeAuth, selectIsAuthenticated, selectAuthLoading } from './store/slices/authSlice';

// Lazy load route components for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));

// Loading fallback component for route lazy loading
const RouteLoadingFallback = () => (
  <div className="layout-centered">
    <div className="spinner spinner--lg"></div>
    <p className="text-muted mt-4">Loading page...</p>
  </div>
);

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

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

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <main className="main bg-background">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

function App() {
  const dispatch = useAppDispatch();

  // Initialize auth on app mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="comment-system-theme">
      <AppRoutes />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
