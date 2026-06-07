import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Droplet, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="glass-panel p-8 md:p-12 w-full animate-slide-up relative">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(225,29,72,0.15)] flex items-center justify-center mb-4">
          <Droplet className="text-primary" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm text-center">Sign in to your LifeLink account to continue</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            className="glass-input w-full pl-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="password"
            placeholder="Password"
            className="glass-input w-full pl-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Link to="#" className="text-xs text-primary hover:text-rose-400 transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="btn-primary mt-2 flex items-center justify-center gap-2">
          Sign In
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-rose-400 font-medium transition-colors">
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
