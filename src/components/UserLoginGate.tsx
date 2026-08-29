import React, { useState } from 'react';
import { Airman } from '../types';
import { Logo155UASU } from './Logo155UASU';
import { Shield, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound, Sparkles, UserCheck } from 'lucide-react';
import { setUserSession, validateUserLogin } from '../utils/authSession';

interface UserLoginGateProps {
  airmen: Airman[];
  onAuthenticated: () => void;
}

export const UserLoginGate: React.FC<UserLoginGateProps> = ({ airmen, onAuthenticated }) => {
  const [bdInput, setBdInput] = useState<string>('474455');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successAirman, setSuccessAirman] = useState<Airman | null>(null);

  const performLogin = (inputBd: string) => {
    setErrorMsg('');
    const cleanInput = inputBd.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '');
    if (!cleanInput) {
      setErrorMsg('Please enter your BD Number to continue.');
      return;
    }

    setIsLoading(true);

    const validation = validateUserLogin(cleanInput, airmen);

    if (validation.success && validation.airman) {
      const airman = validation.airman;
      setSuccessAirman(airman);
      const role = validation.detailedUser?.role || (cleanInput === '474455' ? 'ADMIN' : 'USER');
      setUserSession(airman, role);
      setTimeout(() => {
        setIsLoading(false);
        onAuthenticated();
      }, 500);
    } else {
      setIsLoading(false);
      setErrorMsg(validation.message || `BD/${cleanInput} is not authorized for login access.`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(bdInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 select-none overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white text-center">
        {/* Crest & Unit Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-20 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-center p-2 shadow-lg">
            <Logo155UASU className="w-12 h-16" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-1.5">
              <Shield className="w-3 h-3" />
              <span>SECURITY ACCESS GATE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              155 UASU BAF
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Personnel Duty & Routine Management System
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restricted Military Portal</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
              1st Login: 474455
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Enter your detailed <strong>BD Number</strong> to verify unit authorization and enter the system.
          </p>
        </div>

        {/* Primary 1-Click Quick Access Chip */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-left flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-400">1st Login User ID</div>
              <div className="text-xs font-black text-white">BD/474455 • LAC Rasel</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setBdInput('474455');
              performLogin('474455');
            }}
            disabled={isLoading || !!successAirman}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <span>Quick Login</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start space-x-2.5 text-left text-xs text-red-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successAirman && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-2.5 text-left text-xs text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Welcome, <strong>{successAirman.rank} {successAirman.name}</strong> ({successAirman.flightName} Flight)!
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              User ID (Airman BD Number)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
                BD/
              </span>
              <input
                type="text"
                autoFocus
                value={bdInput}
                onChange={(e) => {
                  setBdInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="474455"
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-12 pr-4 py-3 text-sm font-mono font-bold text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
            <p className="text-[10.5px] text-slate-500">
              Enter any BD number detailed or registered in 155 UASU Nominal Roll.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!successAirman}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black tracking-wide uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying BD Number...</span>
            ) : (
              <>
                <span>Enter System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-center space-x-1.5">
          <KeyRound className="w-3 h-3 text-slate-400" />
          <span>All logins are detailed & monitored in Unit Security Logs</span>
        </div>
      </div>
    </div>
  );
};
