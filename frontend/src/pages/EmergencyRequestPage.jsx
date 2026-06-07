import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AlertCircle, Activity, MapPin } from 'lucide-react';

const EmergencyRequestPage = () => {
  const [formData, setFormData] = useState({
    requestType: 'blood',
    bloodGroup: 'O-',
    organType: '',
    units: 1,
    city: '',
    isEmergency: true,
    urgencyLevel: 'critical'
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to broadcast request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in relative">
      {/* Intense red glow for emergency page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary opacity-10 blur-[120px] pointer-events-none z-[-1]"></div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgba(225,29,72,0.15)] mb-4 shadow-[0_0_50px_rgba(225,29,72,0.3)]">
          <AlertCircle className="text-primary animate-pulse" size={40} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Emergency Broadcast</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Instantly alert all compatible donors within a 25-mile radius. Use only for life-threatening situations.</p>
      </div>

      <div className="glass-panel p-8 border-primary/30 shadow-[0_0_30px_rgba(225,29,72,0.1)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Requirement Type</label>
                <div className="flex gap-4">
                  <label className={`flex-1 cursor-pointer py-3 px-4 rounded-xl text-center border transition-all ${formData.requestType === 'blood' ? 'bg-[rgba(225,29,72,0.15)] border-primary text-primary font-bold' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400'}`}>
                    <input type="radio" name="reqType" className="hidden" checked={formData.requestType === 'blood'} onChange={() => setFormData({...formData, requestType: 'blood', organType: ''})} />
                    Blood
                  </label>
                  <label className={`flex-1 cursor-pointer py-3 px-4 rounded-xl text-center border transition-all ${formData.requestType === 'organ' ? 'bg-[rgba(225,29,72,0.15)] border-primary text-primary font-bold' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400'}`}>
                    <input type="radio" name="reqType" className="hidden" checked={formData.requestType === 'organ'} onChange={() => setFormData({...formData, requestType: 'organ'})} />
                    Organ
                  </label>
                </div>
              </div>

              {formData.requestType === 'blood' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Blood Group Needed</label>
                  <select 
                    className="glass-input w-full text-lg"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="O-">O- (Universal Donor)</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+ (Universal Recipient)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Organ Type Needed</label>
                  <select 
                    className="glass-input w-full text-lg"
                    value={formData.organType}
                    onChange={(e) => setFormData({...formData, organType: e.target.value})}
                  >
                    <option value="kidney">Kidney</option>
                    <option value="liver">Liver</option>
                    <option value="heart">Heart</option>
                    <option value="lungs">Lungs</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Units Required</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" max="10" 
                    className="flex-1 accent-primary"
                    value={formData.units}
                    onChange={(e) => setFormData({...formData, units: parseInt(e.target.value)})}
                  />
                  <span className="bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-xl font-bold text-white w-16 text-center">
                    {formData.units}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target City / Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                  <input 
                    type="text" 
                    className="glass-input w-full pl-12 text-lg" 
                    placeholder="Enter city name..."
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
            <button 
              type="submit" 
              className="w-full py-4 rounded-xl bg-primary hover:bg-rose-500 text-white text-lg font-bold shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_rgba(225,29,72,0.7)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              disabled={loading}
            >
              <AlertCircle size={24} />
              {loading ? 'Broadcasting...' : 'BROADCAST EMERGENCY SOS'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">By clicking this, you confirm this is a verified medical emergency.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyRequestPage;
