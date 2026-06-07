import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, BarChart2, Map, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
    { icon: Users, path: '/donors', label: 'Donors' },
    { icon: Activity, path: '/requests', label: 'Requests' },
    { icon: BarChart2, path: '/charts', label: 'Analytics' },
    { icon: Map, path: '/map', label: 'Map View' },
    { icon: AlertCircle, path: '/emergency', label: 'Emergency' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-[72px] bg-[#0F172A] border-r border-[rgba(255,255,255,0.06)] flex flex-col items-center py-6 z-20">
      <div className="mb-8">
        {/* Blood Drop Logo without text */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative p-3 rounded-xl flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[rgba(225,29,72,0.1)] text-primary border-l-2 border-primary' 
                  : 'text-slate-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-slate-200'
              }`
            }
          >
            <item.icon size={22} />
            {/* Tooltip */}
            <div className="absolute left-14 bg-navy-light text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[rgba(255,255,255,0.1)] shadow-xl">
              {item.label}
            </div>
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={logout}
        className="group relative p-3 rounded-xl text-slate-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-primary transition-all w-12 h-12 flex items-center justify-center"
      >
        <LogOut size={22} />
        <div className="absolute left-14 bg-navy-light text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[rgba(255,255,255,0.1)] shadow-xl">
          Logout
        </div>
      </button>
    </div>
  );
};

export default Sidebar;
