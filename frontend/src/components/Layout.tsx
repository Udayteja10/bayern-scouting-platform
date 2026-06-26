import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import {
  LayoutDashboard, Users, Search, ArrowLeftRight,
  BarChart3, RefreshCw, LogOut, Shield, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/squad', icon: Users, label: 'Squad' },
  { to: '/players', icon: Search, label: 'Players' },
  { to: '/scouting', icon: Shield, label: 'Scouting' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/sync', icon: RefreshCw, label: 'Sync' },
];

const roleColors: Record<string, string> = {
  CLUB_OWNER: 'badge-red',
  SPORTING_DIRECTOR: 'badge-blue',
  RECRUITMENT_ANALYST: 'badge-green',
  FINANCE_MANAGER: 'badge-yellow',
};

const roleLabels: Record<string, string> = {
  CLUB_OWNER: 'Club Owner',
  SPORTING_DIRECTOR: 'Sporting Director',
  RECRUITMENT_ANALYST: 'Analyst',
  FINANCE_MANAGER: 'Finance Manager',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bayern-dark overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex-shrink-0
        bg-bayern-dark-2 border-r border-bayern-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-bayern-border flex items-center gap-3 bg-bayern-red">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/250px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png"
            alt="FC Bayern"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div className="font-extrabold text-white text-sm leading-tight tracking-wide">FC Bayern München</div>
            <div className="text-[10px] text-white/80 font-medium">Intelligence Platform</div>
          </div>
          <button
            className="ml-auto lg:hidden text-white/80 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-bayern-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bayern-red to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-bayern-text-muted truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`badge text-xs ${roleColors[user?.role ?? ''] ?? 'badge-gray'}`}>
              {roleLabels[user?.role ?? ''] ?? user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-bayern-text-muted hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-bayern-border bg-bayern-dark-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-bayern-red transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-white">FC Bayern Intelligence</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
