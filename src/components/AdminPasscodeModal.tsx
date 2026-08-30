
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Unlock, ShieldCheck, Crown, ShieldAlert, AlertTriangle, CheckCircle2, Delete, Loader2, KeyRound } from 'lucide-react';
import { UserRole } from '../types';
import { getDetailedUsers, saveDetailedUsers } from '../utils/authSession';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
  assignedRole: UserRole;
  bdNo?: string;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assignedRole,
  bdNo
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockRemainingSec, setLockRemainingSec] = useState(0);

  const [isResetMode, setIsResetMode] = useState(false);
  const [overrideKey, setOverrideKey] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setErrorMsg('');
      setIsSuccess(false);
      setIsVerifying(false);
      setIsResetMode(false);
      setOverrideKey('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (lockRemainingSec > 0) {
      timer = window.setInterval(() => {
        setLockRemainingSec((prev) => prev - 1);
      }, 1000);
    } else if (lockRemainingSec === 0 && attempts >= 3) {
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [lockRemainingSec, attempts]);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!passcode) return;
    if (lockRemainingSec > 0) return;

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);

      const cleanBd = (bdNo || '').replace(/^BD\/?/i, '').trim().toLowerCase();
      const users = getDetailedUsers();
      const user = users.find(u => u.bdNo.toLowerCase() === cleanBd);
      const isDefaultOwner = cleanBd === '474455';
      
      // Fetch fresh admin pass directly from storage, fallback to 1124 for the default owner
      const actualAdminPass = user?.adminPass || (isDefaultOwner ? '1124' : '');

      if (passcode === actualAdminPass) {
        setIsSuccess(true);
        setTimeout(() => {
          // Pass the actual role they are supposed to have based on their user record
          const actualRole = user?.role || (isDefaultOwner ? 'SUPER_ADMIN' : assignedRole);
          onSuccess(actualRole);
        }, 800);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setErrorMsg('Incorrect Admin Passcode');
        setPasscode('');
        
        if (newAttempts >= 3) {
          setLockRemainingSec(30);
          setErrorMsg('Too many failed attempts.');
        }
      }
    }, 500);
  };

  const handleReset = () => {
    if (overrideKey.trim().toLowerCase() === 'baf155') {
      const cleanBd = (bdNo || '').replace(/^BD\/?/i, '').trim().toLowerCase();
      const users = getDetailedUsers();
      const idx = users.findIndex(u => u.bdNo.toLowerCase() === cleanBd);
      
      if (idx >= 0) {
        users[idx].adminPass = '1124';
        saveDetailedUsers(users);
      } else if (cleanBd) {
         // Create stub if somehow doesn't exist
         users.push({
            id: `detail-${cleanBd}-${Date.now()}`,
            bdNo: cleanBd,
            adminPass: '1124',
            role: assignedRole,
            status: 'ACTIVE',
            airmanId: '',
            rank: '',
            name: '',
            flightName: '',
            trade: ''
         });
         saveDetailedUsers(users);
      }
      
      alert("Success! Your Admin Passcode has been reset to: 1124");
      setIsResetMode(false);
      setPasscode('');
      setErrorMsg('');
    } else {
      setErrorMsg("Invalid Master Override Key");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isResetMode) handleReset();
      else handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md mb-4">
            {isSuccess ? <Unlock className="w-8 h-8 text-emerald-500 animate-bounce" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            {isResetMode ? 'Reset Admin Passcode' : 'Admin Login'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {isResetMode 
              ? 'Enter the Master Override Key to reset your admin passcode.'
              : 'Enter your Admin Passcode to elevate privileges.'}
          </p>
        </div>

        {lockRemainingSec > 0 && !isResetMode && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Locked for {lockRemainingSec}s</span>
          </div>
        )}

        {!isResetMode ? (
          <>
            <div className="mb-6">
              <input
                ref={inputRef}
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSuccess || isVerifying || lockRemainingSec > 0}
                className={`w-full text-center text-2xl tracking-widest font-black rounded-xl border-2 py-3 outline-none transition-all ${
                  isSuccess ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700' :
                  errorMsg ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:border-rose-700 animate-shake' :
                  'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500'
                }`}
                placeholder="••••"
              />
              {errorMsg && (
                <div className="mt-2 text-xs font-bold text-rose-600 flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={!passcode || isSuccess || isVerifying || lockRemainingSec > 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify Passcode</span>}
            </button>

            <button
              onClick={() => { setIsResetMode(true); setErrorMsg(''); }}
              className="mt-4 text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline cursor-pointer"
            >
              Forgot Admin Passcode?
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <input
                type="password"
                value={overrideKey}
                onChange={(e) => setOverrideKey(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-center text-lg tracking-widest font-bold rounded-xl border-2 py-3 outline-none transition-all border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500"
                placeholder="Master Key"
              />
              {errorMsg && (
                <div className="mt-2 text-xs font-bold text-rose-600 flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => { setIsResetMode(false); setErrorMsg(''); }}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={!overrideKey}
                className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
