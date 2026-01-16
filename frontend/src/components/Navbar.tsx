import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MessageSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl hover:opacity-80 transition-opacity">
          <div className="p-2 bg-primary rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">Comment System</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
