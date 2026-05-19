import { useNavigate, useLocation } from 'react-router';
import { PenLine, LogOut, Home, LayoutDashboard, User } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer"
        >
          <h1 className="text-2xl font-serif">Anthology</h1>
        </div>
        <nav className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}
          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Manage</span>
              </button>
              <button
                onClick={() => navigate('/admin/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={() => navigate('/admin/new')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Write</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
