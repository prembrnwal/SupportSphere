import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, Search, Sun, Moon, Menu, Home, LogOut, User as UserIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import { initials } from '@/lib/utils';

const notifications = [
  { id: 1, text: 'Your ticket TCK-1005 was updated to In Progress', time: '2h ago' },
  { id: 2, text: 'Agent Priya Verma commented on TCK-1002', time: '5h ago' },
  { id: 3, text: 'Ticket TCK-0998 has been resolved', time: '1d ago' },
];

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleSidebar } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-[#0b0d12]/90 backdrop-blur-md px-4 lg:px-6">
      <button className="lg:hidden text-slate-500" onClick={toggleSidebar}>
        <Menu className="h-5.5 w-5.5" />
      </button>

      <div className="relative hidden sm:block flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tickets, users..."
          className="h-9 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus-ring focus:border-teal-500 transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Return to Home Button */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-full transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home Page</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0b0d12]" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-2 shadow-xl animate-fadeUp">
              <p className="px-2 py-1.5 text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-xs font-semibold text-white">
              {user ? initials(user.name) : 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-2 shadow-xl animate-fadeUp">
              <div className="px-2 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <Home className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Home Page
              </Link>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-slate-400" />
                View Profile
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1 border-t border-slate-100 dark:border-white/10"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to log out of SupportHub? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        variant="danger"
      />
    </header>
  );
}
