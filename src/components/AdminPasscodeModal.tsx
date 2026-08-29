import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, KeyRound, X, CheckCircle2, AlertTriangle, Delete, Loader2, Clock } from 'lucide-react';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ATTEMPTS_STORAGE_KEY = 'baf_admin_passcode_attempts';
const LOCK_UNTIL_STORAGE_KEY = 'baf_admin_passcode_lock_until';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_MS = 60 * 1000; // 60 seconds

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lockRemainingSec, setLockRemainingSec] = useState<number>(0);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Check lock status
  const checkLockStatus = () => {
    const lockUntilStr = localStorage.getItem(LOCK_UNTIL_STORAGE_KEY);
    if (lockUntilStr) {
      const lockUntil = parseInt(lockUntilStr, 10);
      const now = Date.now();
      if (lockUntil > now) {
        setLockRemainingSec(Math.ceil((lockUntil - now) / 1000));
        return true;
      } else {
        localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
        setLockRemainingSec(0);
      }
    }
    return false;
  };

  useEffect(() => {
    if (!isOpen) return;

    checkLockStatus();
    setDigits(['', '', '', '']);
    setErrorMsg('');
    setIsSuccess(false);
    setIsVerifying(false);

    const isLocked = checkLockStatus();
    if (!isLocked) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Lock countdown timer
  useEffect(() => {
    if (lockRemainingSec <= 0) return;

    const timer = setInterval(() => {
      const lockUntilStr = localStorage.getItem(LOCK_UNTIL_STORAGE_KEY);
      if (lockUntilStr) {
        const lockUntil = parseInt(lockUntilStr, 10);
        const now = Date.now();
        const remaining = Math.ceil((lockUntil - now) / 1000);
        if (remaining > 0) {
          setLockRemainingSec(remaining);
        } else {
          localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
          setLockRemainingSec(0);
          clearInterval(timer);
          setTimeout(() => {
            inputRefs[0].current?.focus();
          }, 100);
        }
      } else {
        setLockRemainingSec(0);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockRemainingSec]);

  if (!isOpen) return null;

  const recordFailedAttempt = () => {
    const now = Date.now();
    let attempts: number[] = [];
    try {
      const saved = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      if (saved) {
        attempts = JSON.parse(saved);
      }
    } catch {
      attempts = [];
    }

    // Filter attempts in window
    attempts = attempts.filter((t) => now - t < WINDOW_MS);
    attempts.push(now);
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));

    if (attempts.length >= MAX_ATTEMPTS) {
      const lockUntil = now + LOCKOUT_MS;
      localStorage.setItem(LOCK_UNTIL_STORAGE_KEY, lockUntil.toString());
      setLockRemainingSec(Math.ceil(LOCKOUT_MS / 1000));
      setErrorMsg(`Too many failed attempts. Locked for ${Math.ceil(LOCKOUT_MS / 1000)} seconds.`);
    }
  };

  const clearAttempts = () => {
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
    localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
    setLockRemainingSec(0);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (lockRemainingSec > 0 || isSuccess || isVerifying) return;
    if (!/^\d*$/.test(value)) return;

    const char = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg('');

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 4) {
      verifyPasscode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (lockRemainingSec > 0 || isSuccess || isVerifying) return;

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      verifyPasscode(digits.join(''));
    }
  };

  const handleKeypadPress = (val: string) => {
    if (lockRemainingSec > 0 || isSuccess || isVerifying) return;

    if (val === 'backspace') {
      const lastFilledIndex = digits.map((d, i) => (d ? i : -1)).filter((i) => i >= 0).pop();
      if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
        const newDigits = [...digits];
        newDigits[lastFilledIndex] = '';
        setDigits(newDigits);
        setErrorMsg('');
        inputRefs[lastFilledIndex].current?.focus();
      }
      return;
    }

    if (val === 'clear') {
      setDigits(['', '', '', '']);
      setErrorMsg('');
      inputRefs[0].current?.focus();
      return;
    }

    // Number pressed
    const firstEmptyIndex = digits.findIndex((d) => !d);
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = val;
      setDigits(newDigits);
      setErrorMsg('');

      if (firstEmptyIndex < 3) {
        inputRefs[firstEmptyIndex + 1].current?.focus();
      }

      const fullCode = newDigits.join('');
      if (fullCode.length === 4) {
        verifyPasscode(fullCode);
      }
    }
  };

  const verifyPasscode = async (code: string) => {
    if (lockRemainingSec > 0 || isVerifying || code.length !== 4) return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        clearAttempts();
        setIsSuccess(true);
        setErrorMsg('');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        recordFailedAttempt();
        setErrorMsg(data.error || 'Incorrect passcode! Please try again.');
        setDigits(['', '', '', '']);
        setTimeout(() => {
          inputRefs[0].current?.focus();
        }, 50);
      }
    } catch {
      // Secure fallback: do NOT bypass verification
      recordFailedAttempt();
      setErrorMsg('Could not verify passcode, please check your connection and try again.');
      setDigits(['', '', '', '']);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden text-center">
        {/* Decorative ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Branding */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
              {isSuccess ? (
                <Unlock className="w-8 h-8 text-emerald-500 animate-bounce" />
              ) : isVerifying ? (
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              ) : lockRemainingSec > 0 ? (
                <Clock className="w-8 h-8 text-rose-500 animate-pulse" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow-xs">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Authorization • 155 UASU</span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Enter 4-digit master passcode to unlock Admin SNCO mode and duty assignment tools.
          </p>
        </div>

        {/* Lockout banner */}
        {lockRemainingSec > 0 && (
          <div className="my-4 p-3.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Too many failed attempts. Locked for {lockRemainingSec}s.</span>
          </div>
        )}

        {/* 4 Digit Boxes */}
        <div className="my-6">
          <div className="flex justify-center items-center space-x-3 sm:space-x-4">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isSuccess || isVerifying || lockRemainingSec > 0}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : errorMsg
                    ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-shake'
                    : digit
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-slate-900 dark:text-white ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            ))}
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center space-x-1.5 animate-fadeIn">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Passcode verified! Unlocking Admin Mode...</span>
            </div>
          )}
        </div>

        {/* On-screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={lockRemainingSec > 0 || isSuccess || isVerifying}
              onClick={() => handleKeypadPress(num)}
              className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={lockRemainingSec > 0 || isSuccess || isVerifying}
            onClick={() => handleKeypadPress('clear')}
            className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={lockRemainingSec > 0 || isSuccess || isVerifying}
            onClick={() => handleKeypadPress('0')}
            className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            0
          </button>
          <button
            type="button"
            disabled={lockRemainingSec > 0 || isSuccess || isVerifying}
            onClick={() => handleKeypadPress('backspace')}
            className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-[12px] text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium hover:underline cursor-pointer"
          >
            Cancel (Stay in Airman View)
          </button>
        </div>
      </div>
    </div>
  );
};
