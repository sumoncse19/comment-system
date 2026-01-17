import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeAuth, selectIsAuthenticated, selectAuthLoading } from './store/slices/authSlice';
import './App.css';

// Lazy load route components for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));

// Loading fallback component for route lazy loading
const RouteLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
    <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
    <p className="text-muted-foreground">Loading page...</p>
  </div>
);

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading...</p>
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
      <main className="min-h-[calc(100vh-64px)] bg-background">
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
