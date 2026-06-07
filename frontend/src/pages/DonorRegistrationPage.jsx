import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Heart, Activity, MapPin, Phone } from 'lucide-react';

const DonorRegistrationPage = () => {
  const [formData, setFormData] = useState({
    donorType: 'blood',
    bloodGroup: 'O+',
    organType: '',
    phone: '',
    city: '',
    address: '',
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128] // Default to NY for demo
    }
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/donors', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Complete Your Donor Profile</h2>
        <p className="text-slate-400">Thank you for joining LifeLink. Your donation can save lives.</p>
      </div>

      <div className="glass-panel p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel !border-[rgba(255,255,255,0.05)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-primary" size={20} />
                <h3 className="text-lg font-medium text-white">Donation Type</h3>
              </div>
              
              <div className="flex gap-4 mb-4">
                <label className={`flex-1 cursor-pointer py-2 px-4 rounded-lg text-center border transition-all ${formData.donorType === 'blood' ? 'bg-[rgba(225,29,72,0.15)] border-primary text-primary' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400'}`}>
                  <input type="radio" name="type" className="hidden" checked={formData.donorType === 'blood'} onChange={() => setFormData({...formData, donorType: 'blood', organType: ''})} />
                  Blood
                </label>
                <label className={`flex-1 cursor-pointer py-2 px-4 rounded-lg text-center border transition-all ${formData.donorType === 'organ' ? 'bg-[rgba(192,132,252,0.15)] border-purple text-purple-400' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400'}`}>
                  <input type="radio" name="type" className="hidden" checked={formData.donorType === 'organ'} onChange={() => setFormData({...formData, donorType: 'organ'})} />
                  Organ
                </label>
              </div>

              {formData.donorType === 'blood' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Blood Group</label>
                  <select 
                    className="glass-input w-full"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Organ Type</label>
                  <select 
                    className="glass-input w-full"
                    value={formData.organType}
                    onChange={(e) => setFormData({...formData, organType: e.target.value})}
                  >
                    <option value="kidney">Kidney</option>
                    <option value="liver">Liver</option>
                    <option value="heart">Heart</option>
                    <option value="cornea">Cornea</option>
                    <option value="lungs">Lungs</option>
                  </select>
                </div>
              )}
            </div>

            <div className="glass-panel !border-[rgba(255,255,255,0.05)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-info" size={20} />
                <h3 className="text-lg font-medium text-white">Contact & Location</h3>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="tel" 
                      className="glass-input w-full pl-10" 
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary mt-4"
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistrationPage;
