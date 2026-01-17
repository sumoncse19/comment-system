import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MessageSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <div className="flex items-center justify-center p-2 bg-primary rounded-lg">
            <MessageSquare className="text-primary-foreground" style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <span className="hidden sm:inline">Comment System</span>
        </Link>

        <div className="navbar__actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <div className="navbar__user hidden md:flex">
                <div className="navbar__user-info">
                  <span className="navbar__username">{user?.username}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-secondary">
                  <User style={{ width: '1rem', height: '1rem' }} className="text-muted" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut style={{ width: '1rem', height: '1rem' }} />
                <span className="ml-2">Logout</span>
              </Button>
            </>
          ) : (
            <div className="navbar__auth-links">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
