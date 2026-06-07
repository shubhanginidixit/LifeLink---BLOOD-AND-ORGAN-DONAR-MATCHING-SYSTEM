import React from 'react';
import DonorMap from '../components/DonorMap';

const MapPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Live Geographic View</h2>
        <p className="text-slate-400 text-sm">Real-time location of donors, hospitals, and active emergencies</p>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.05)]">
        <DonorMap />
      </div>
    </div>
  );
};

export default MapPage;
