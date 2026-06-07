import React, { useEffect, useState } from 'react';
import { Users, Activity, Heart, Building } from 'lucide-react';

const icons = {
  Users: { icon: Users, color: 'text-primary', bg: 'bg-[rgba(225,29,72,0.15)]' },
  Activity: { icon: Activity, color: 'text-warning', bg: 'bg-[rgba(245,158,11,0.15)]' },
  Heart: { icon: Heart, color: 'text-success', bg: 'bg-[rgba(34,197,94,0.15)]' },
  Building: { icon: Building, color: 'text-info', bg: 'bg-[rgba(59,130,246,0.15)]' },
};

const KPICard = ({ title, value, iconName }) => {
  const { icon: Icon, color, bg } = icons[iconName] || icons.Users;
  const [count, setCount] = useState(0);

  // Simple count-up animation
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) return;
    
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-panel p-6 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon className={color} size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{count}</h3>
      </div>
    </div>
  );
};

export default KPICard;
