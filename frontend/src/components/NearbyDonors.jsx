import React from 'react';
import { MapPin } from 'lucide-react';

const NearbyDonors = ({ donors }) => {
  const data = donors || [
    { id: 1, name: 'Alex Johnson', group: 'O-', distance: '1.2 km', type: 'Blood' },
    { id: 2, name: 'Sarah Williams', group: 'A+', distance: '2.5 km', type: 'Blood' },
    { id: 3, name: 'Michael Brown', group: 'Kidney', distance: '3.8 km', type: 'Organ' },
    { id: 4, name: 'Emily Davis', group: 'AB+', distance: '4.1 km', type: 'Blood' },
  ];

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Nearby Available Donors</h3>
        <button className="text-xs text-slate-300 hover:text-white transition-colors">Map View</button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map(donor => (
          <div key={donor.id} className="bg-[rgba(15,23,42,0.4)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-2 py-1 rounded text-xs font-bold ${donor.type === 'Organ' ? 'bg-[rgba(192,132,252,0.15)] text-purple-400' : 'bg-[rgba(225,29,72,0.15)] text-primary'}`}>
                {donor.group}
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <MapPin size={12} className="mr-1" />
                {donor.distance}
              </div>
            </div>
            <h4 className="text-sm font-medium text-white truncate">{donor.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{donor.type} Donor</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyDonors;
