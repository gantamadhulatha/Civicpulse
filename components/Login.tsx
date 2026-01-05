
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for a real auth feel
    setTimeout(() => {
      if (email && (isRegister ? name : true)) {
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          name: name || email.split('@')[0],
          email
        });
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-slate-100 z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6 shadow-2xl shadow-indigo-300 transition-transform hover:rotate-0 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CivicPulse</h1>
          <p className="text-slate-500 mt-3 font-semibold uppercase tracking-widest text-xs">Official Maintenance Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                placeholder="Citizen Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email</label>
            <input
              type="email"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
              placeholder="name@portal.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Access</label>
            <input
              type="password"
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-200 transition-all transform active:scale-[0.97] disabled:opacity-70 text-sm uppercase tracking-widest"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isRegister ? 'Creating Account' : 'Verifying Access'}
              </span>
            ) : (
              isRegister ? 'Join Platform' : 'Secure Login'
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 pt-8">
          <p className="text-slate-400 text-sm font-medium">
            {isRegister ? 'Already registered?' : "Need city portal access?"}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase text-[10px] tracking-widest border-b-2 border-indigo-100 pb-0.5"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
