import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const EmergencyPanel = () => {
  const [formData, setFormData] = useState({
    type: 'blood',
    group: 'O-',
    city: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Emergency requested:', formData);
    // Submit to API
  };

  return (
    <div className="glass-panel relative overflow-hidden h-full flex flex-col">
      {/* Red accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <div className="p-6 relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[rgba(225,29,72,0.15)] flex items-center justify-center">
            <AlertCircle className="text-primary animate-pulse" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Emergency Request</h3>
            <p className="text-xs text-slate-400 text-primary">Priority Broadcasting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
              <select 
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="blood">Blood</option>
                <option value="organ">Organ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Blood/Organ</label>
              <select 
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary"
                value={formData.group}
                onChange={(e) => setFormData({...formData, group: e.target.value})}
              >
                {formData.type === 'blood' ? (
                  <>
                    <option value="O-">O-</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="AB-">AB-</option>
                  </>
                ) : (
                  <>
                    <option value="kidney">Kidney</option>
                    <option value="liver">Liver</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
            <input 
              type="text" 
              placeholder="E.g. New York"
              className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <button type="submit" className="mt-auto w-full py-3 rounded-lg bg-primary hover:bg-rose-500 text-white font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all">
            Broadcast SOS
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyPanel;
