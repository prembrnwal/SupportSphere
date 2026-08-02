import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  UserCog,
  User,
  LogOut,
  LifeBuoy,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const customerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets/create', label: 'Create Ticket', icon: PlusCircle },
  { to: '/tickets', label: 'My Tickets', icon: Ticket },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/assign', label: 'Assign Tickets', icon: UserCog },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isAdmin = user?.role === 'admin';

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <LifeBuoy className="h-4.5 w-4.5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">SupportHub</span>
        <button className="ml-auto lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</p>
        {customerLinks.map((link) => (
          <NavItem key={link.to} {...link} onClick={() => setSidebarOpen(false)} />
        ))}

        {isAdmin && (
          <>
            <p className="px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} onClick={() => setSidebarOpen(false)} />
            {adminLinks.map((link) => (
              <NavItem key={link.to} {...link} onClick={() => setSidebarOpen(false)} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-slate-100 dark:border-white/10 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#0d0f16]">
        {content}
      </aside>

      {/* Mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity',
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-72 bg-white dark:bg-[#0d0f16] shadow-xl transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard' || to === '/admin' || to === '/tickets'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
        )
      }
    >
      <Icon className="h-4.5 w-4.5" />
      {label}
    </NavLink>
  );
}
