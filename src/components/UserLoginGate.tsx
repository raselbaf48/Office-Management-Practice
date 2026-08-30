import React, { useState } from 'react';
import { Airman } from '../types';
import { Logo155UASU } from './Logo155UASU';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, Lock, LogIn } from 'lucide-react';
import { setUserSession, validateUserLogin, getDetailedUsers, saveDetailedUsers } from '../utils/authSession';

interface UserLoginGateProps {
  airmen: Airman[];
  onAuthenticated: () => void;
}

export const UserLoginGate: React.FC<UserLoginGateProps> = ({ airmen, onAuthenticated }) => {
  const [bdInput, setBdInput] = useState<string>('');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [resetBd, setResetBd] = useState<string>('');
  const [overrideKey, setOverrideKey] = useState<string>('');
  
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideKey.trim().toLowerCase() === 'baf155') {
      const cleanBd = resetBd.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
      const users = getDetailedUsers(airmen);
      const idx = users.findIndex(u => u.bdNo.toLowerCase() === cleanBd);

      if (idx >= 0) {
        users[idx].password = users[idx].bdNo; // reset to BD No
        saveDetailedUsers(users);
        alert(`Password for BD/${users[idx].bdNo.toUpperCase()} has been reset to their BD Number.`);
      } else {
        alert(`User BD/${cleanBd.toUpperCase()} not found in detailed records. Their default password is already their BD Number.`);
      }
      setIsResetMode(false);
      setResetBd('');
      setOverrideKey('');
    } else {
      setErrorMsg('Invalid Master Override Key');
    }
  };
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successAirman, setSuccessAirman] = useState<Airman | null>(null);

  const performLogin = (inputBd: string, inputPassword: string) => {
    setErrorMsg('');
    const cleanInput = inputBd.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '');
    if (!cleanInput) {
      setErrorMsg('Please enter your User ID.');
      return;
    }

    setIsLoading(true);

    const validation = validateUserLogin(cleanInput, inputPassword, airmen);

    if (validation.success && validation.airman) {
      const airman = validation.airman;
      setSuccessAirman(airman);
      setUserSession(airman, validation.detailedUser?.role || 'USER', validation.detailedUser);
      setTimeout(() => {
        setIsLoading(false);
        onAuthenticated();
      }, 400);
    } else {
      setIsLoading(false);
      setErrorMsg(
        validation.message ||
          'You are not authorized to access the portal. User ID error, please enter correct User ID.'
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(bdInput, passwordInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 select-none">
      {/* Subtle Military Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Clean User Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-white text-center">
        {/* Crest & Unit Identity */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-20 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center p-2 shadow-lg">
            <Logo155UASU className="h-16 w-16" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-1.5">
              <Shield className="w-3 h-3" />
              <span>USER LOGIN PORTAL</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              155 UASU BAF
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Personnel Office Management System
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/70 border border-red-800 rounded-2xl flex items-start space-x-2.5 text-left text-xs text-red-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successAirman && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 rounded-2xl flex items-center space-x-2.5 text-left text-xs text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Welcome, <strong>{successAirman.rank} {successAirman.name}</strong>!
            </span>
          </div>
        )}

        {/* Pure User Login Form */}
        
        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target User ID (BD No)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold">BD/</span>
                </div>
                <input
                  type="text"
                  value={resetBd}
                  onChange={(e) => setResetBd(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="474455"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Override Key</label>
              <input
                type="password"
                value={overrideKey}
                onChange={(e) => setOverrideKey(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                placeholder="Enter Key"
                required
              />
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 p-3 rounded-lg text-sm font-medium border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors shadow-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!resetBd || !overrideKey}
                className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-amber-900/20 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

          <div className="text-left space-y-2">
            <label htmlFor="user_id_input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              User ID
            </label>
            <div className="relative">
              <input
                id="user_id_input"
                type="text"
                autoFocus
                value={bdInput}
                onChange={(e) => {
                  setBdInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder=""
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="text-left space-y-2">
            <label htmlFor="password_input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password_input"
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder=""
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="user_login_btn"
            type="submit"
            disabled={isLoading || !!successAirman}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-black tracking-wide uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-900/40 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying User ID...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => { setIsResetMode(true); setErrorMsg(''); }}
                className="text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer underline"
              >
                Forgot Login Password?
              </button>
            </div>
          </form>
        )}
        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Restricted Personnel Access • 155 UASU BAF</span>
        </div>
      </div>
    </div>
  );
};
