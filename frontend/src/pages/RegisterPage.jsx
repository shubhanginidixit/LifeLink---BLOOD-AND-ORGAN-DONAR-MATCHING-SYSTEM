import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Droplet, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await register(formData);
      if (formData.role === 'donor') {
        navigate('/register-donor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="glass-panel p-8 md:p-12 w-full animate-slide-up relative mt-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(225,29,72,0.15)] flex items-center justify-center mb-4">
          <Droplet className="text-primary" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm text-center">Join LifeLink to start making an impact</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Full Name / Hospital Name"
            className="glass-input w-full pl-11"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            className="glass-input w-full pl-11"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            className="glass-input w-full pl-11"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'donor' ? 'bg-[rgba(225,29,72,0.1)] border-primary text-white' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400 hover:border-[rgba(255,255,255,0.2)]'}`}>
            <input type="radio" name="role" value="donor" className="hidden" checked={formData.role === 'donor'} onChange={() => setFormData({...formData, role: 'donor'})} />
            <User size={24} className={formData.role === 'donor' ? 'text-primary' : ''} />
            <span className="text-sm font-medium">I am a Donor</span>
          </label>
          
          <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'hospital' ? 'bg-[rgba(59,130,246,0.1)] border-info text-white' : 'bg-[rgba(15,23,42,0.4)] border-[rgba(255,255,255,0.05)] text-slate-400 hover:border-[rgba(255,255,255,0.2)]'}`}>
            <input type="radio" name="role" value="hospital" className="hidden" checked={formData.role === 'hospital'} onChange={() => setFormData({...formData, role: 'hospital'})} />
            <Building size={24} className={formData.role === 'hospital' ? 'text-info' : ''} />
            <span className="text-sm font-medium">I am a Hospital</span>
          </label>
        </div>

        <button type="submit" className="btn-primary mt-4 flex items-center justify-center gap-2">
          Create Account
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-rose-400 font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
