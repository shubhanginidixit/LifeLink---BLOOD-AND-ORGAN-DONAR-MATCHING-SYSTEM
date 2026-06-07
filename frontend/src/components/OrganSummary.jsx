import React from 'react';
import { Activity, Circle, Shield, Droplet } from 'lucide-react';

const OrganSummary = ({ data }) => {
  const organs = data || [
    { name: 'Kidney', count: 45, icon: Circle, color: 'text-purple-400', bg: 'bg-[rgba(192,132,252,0.15)]' },
    { name: 'Liver', count: 28, icon: Activity, color: 'text-rose-400', bg: 'bg-[rgba(251,113,133,0.15)]' },
    { name: 'Heart', count: 12, icon: Shield, color: 'text-blue-400', bg: 'bg-[rgba(96,165,250,0.15)]' },
    { name: 'Cornea', count: 64, icon: Droplet, color: 'text-emerald-400', bg: 'bg-[rgba(52,211,153,0.15)]' },
  ];

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Organ Availability</h3>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {organs.map((organ, i) => (
          <div key={i} className="bg-[rgba(15,23,42,0.4)] rounded-xl p-4 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-default">
            <div className={`w-10 h-10 rounded-full ${organ.bg} flex items-center justify-center mb-3`}>
              <organ.icon className={organ.color} size={20} />
            </div>
            <h4 className="text-2xl font-bold text-white leading-none mb-1">{organ.count}</h4>
            <p className="text-xs text-slate-400">{organ.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganSummary;
