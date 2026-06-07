import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const TopBar = () => {
  const { profile } = useAuth();

  return (
    <header className="h-20 w-full flex items-center justify-between px-8 z-10 pt-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome back, {profile?.full_name || 'User'}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-[rgba(15,23,42,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-64"
          />
        </div>

        <button className="relative p-2 rounded-full bg-[rgba(30,41,59,0.6)] border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#0F172A]"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[rgba(255,255,255,0.1)]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple flex items-center justify-center shadow-lg">
            <User size={20} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 capitalize">{profile?.role || 'Role'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
