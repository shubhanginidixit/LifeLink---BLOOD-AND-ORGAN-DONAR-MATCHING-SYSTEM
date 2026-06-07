import React from 'react';
import { Bell, Heart, AlertTriangle } from 'lucide-react';

const NotificationFeed = ({ notifications }) => {
  const data = notifications || [
    { id: 1, type: 'match', title: 'Match Found!', message: 'You have been matched with Mercy Hospital.', time: '10 min ago', read: false },
    { id: 2, type: 'emergency', title: 'EMERGENCY: O- Needed', message: 'City General needs O- blood immediately.', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Profile Updated', message: 'Your donor profile has been updated.', time: '2 days ago', read: true },
  ];

  const getIcon = (type) => {
    if (type === 'match') return <Heart size={16} className="text-info" />;
    if (type === 'emergency') return <AlertTriangle size={16} className="text-primary" />;
    return <Bell size={16} className="text-slate-400" />;
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">2 New</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
        {data.map(notif => (
          <div key={notif.id} className={`p-4 rounded-xl border ${notif.read ? 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.03)]' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]'} transition-colors cursor-pointer hover:bg-[rgba(255,255,255,0.08)]`}>
            <div className="flex gap-3">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'match' ? 'bg-[rgba(59,130,246,0.15)]' : notif.type === 'emergency' ? 'bg-[rgba(225,29,72,0.15)]' : 'bg-[rgba(255,255,255,0.05)]'}`}>
                {getIcon(notif.type)}
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-semibold ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationFeed;
