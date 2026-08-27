import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  KeyRound, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { Logo155UASU } from './Logo155UASU';
import { UserRole, ThemePreference } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onOpenAdminLogin: () => void;
  onRosterUpdated?: () => void;
}

type SettingSection = 'appearance' | 'logo' | 'security' | 'database';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  role,
  currentTheme,
  onThemeChange,
  onOpenAdminLogin,
  onRosterUpdated,
}) => {
  // Collapsible Accordion: Default null (all collapsed list)
  const [activeSection, setActiveSection] = useState<SettingSection | null>(null);

  // Logo Change State
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('baf_custom_logo'));
  const [logoSuccess, setLogoSuccess] = useState<string>('');

  // Security Tab State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [isUpdatingPasscode, setIsUpdatingPasscode] = useState(false);

  // Database Backup State
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPasscodeError('');
      setPasscodeSuccess('');
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setLogoSuccess('');
      setRestoreStatus('');
      setCustomLogo(localStorage.getItem('baf_custom_logo'));
    }
  }, [isOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem('baf_custom_logo', dataUrl);
        setCustomLogo(dataUrl);
        setLogoSuccess('Unit crest logo updated successfully.');
        window.dispatchEvent(new CustomEvent('baf_logo_updated', { detail: { logoUrl: dataUrl } }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    localStorage.removeItem('baf_custom_logo');
    setCustomLogo(null);
    setLogoSuccess('Default 155 UASU BAF crest restored.');
    window.dispatchEvent(new CustomEvent('baf_logo_updated', { detail: { logoUrl: null } }));
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (!currentPasscode || currentPasscode.length !== 4) {
      setPasscodeError('Please enter the current 4-digit master passcode.');
      return;
    }
    if (!newPasscode || newPasscode.length !== 4 || !/^\d{4}$/.test(newPasscode)) {
      setPasscodeError('New passcode must be exactly 4 numeric digits.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeError('New passcode and confirm passcode do not match.');
      return;
    }

    setIsUpdatingPasscode(true);
    try {
      const res = await fetch('/api/auth/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPasscode, newPasscode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasscodeSuccess('Admin master passcode updated successfully.');
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
      } else {
        setPasscodeError(data.error || 'Failed to update passcode.');
      }
    } catch {
      setPasscodeError('Unable to connect to server.');
    } finally {
      setIsUpdatingPasscode(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    try {
      let backupPayload: any = null;
      try {
        const res = await fetch('/api/database/backup');
        if (res.ok) {
          backupPayload = await res.json();
        }
      } catch (e) {
        console.warn('Direct backup endpoint error, fetching data objects:', e);
      }

      // If server returned data or fallback
      if (!backupPayload || !backupPayload.database) {
        const [rRes, aRes] = await Promise.all([
          fetch('/api/roster').catch(() => null),
          fetch('/api/airmen').catch(() => null)
        ]);
        const rData = rRes && rRes.ok ? await rRes.json() : { roster: [] };
        const aData = aRes && aRes.ok ? await aRes.json() : { airmen: [] };
        backupPayload = {
          exportedAt: new Date().toISOString(),
          version: '2.0',
          unit: '155 UASU, BAF BASE ZHR',
          database: {
            airmen: aData.airmen || [],
            roster: rData.roster || []
          }
        };
      }

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BAF_155_UASU_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Backup download error:', err);
      alert('Failed to generate database backup file.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Warning: Restoring from a backup will overwrite the current airmen database and duty roster. Do you want to proceed?')) {
      e.target.value = '';
      return;
    }

    setRestoreStatus('Uploading and restoring database backup...');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const res = await fetch('/api/database/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: text,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setRestoreStatus('Database restored successfully! Refreshing view...');
          if (onRosterUpdated) onRosterUpdated();
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setRestoreStatus(data.error || 'Restore failed. Invalid backup file format.');
        }
      } catch (err: any) {
        setRestoreStatus(`Error: ${err.message || 'Unable to read backup file.'}`);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const settingItems: Array<{
    id: SettingSection;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'appearance',
      title: 'Theme & Appearance',
      subtitle: 'Light / Dark / System adaptive color schemes',
      icon: <Sun className="w-5 h-5" />,
      badge: currentTheme.toUpperCase()
    },
    {
      id: 'logo',
      title: 'Unit Crest & Branding',
      subtitle: 'Upload custom squadron crest or restore official BAF logo',
      icon: <ImageIcon className="w-5 h-5" />,
      badge: customLogo ? 'Custom' : 'Default'
    },
    {
      id: 'security',
      title: 'Admin Passcode & Security',
      subtitle: 'Configure 4-digit master access passcode and authorization',
      icon: <KeyRound className="w-5 h-5" />,
      badge: role === 'ADMIN' ? 'Admin Active' : 'Protected'
    },
    {
      id: 'database',
      title: 'Database Backup & Restore',
      subtitle: 'Download complete system JSON snapshot or restore from file',
      icon: <Database className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                System Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                155 UASU BAF • Duty Roster Configuration & Preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Vertical Collapsible Accordion List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {settingItems.map((item) => {
            const isExpanded = activeSection === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Accordion Header Row Button (Click to toggle) */}
                <button
                  type="button"
                  onClick={() => setActiveSection(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isExpanded
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Section Specific Expanded Interface */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4 animate-fadeIn">
                    {/* 1. APPEARANCE / THEME */}
                    {item.id === 'appearance' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Light */}
                          <button
                            type="button"
                            onClick={() => onThemeChange('light')}
                            className={`p-4 rounded-2xl border-2 text-left flex flex-col items-start transition-all cursor-pointer ${
                              currentTheme === 'light'
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                            }`}
                          >
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 mb-3">
                              <Sun className="w-5 h-5" />
                            </div>
                            <div className="font-black text-sm text-slate-900 dark:text-white">Light Mode</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Bright, high-contrast operational layout
                            </div>
                            {currentTheme === 'light' && (
                              <div className="mt-3 flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </div>
                            )}
                          </button>

                          {/* Dark */}
                          <button
                            type="button"
                            onClick={() => onThemeChange('dark')}
                            className={`p-4 rounded-2xl border-2 text-left flex flex-col items-start transition-all cursor-pointer ${
                              currentTheme === 'dark'
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                            }`}
                          >
                            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-300 dark:bg-slate-700 dark:text-indigo-200 mb-3">
                              <Moon className="w-5 h-5" />
                            </div>
                            <div className="font-black text-sm text-slate-900 dark:text-white">Dark Mode</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Low-light night duty comfort
                            </div>
                            {currentTheme === 'dark' && (
                              <div className="mt-3 flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </div>
                            )}
                          </button>

                          {/* System */}
                          <button
                            type="button"
                            onClick={() => onThemeChange('system')}
                            className={`p-4 rounded-2xl border-2 text-left flex flex-col items-start transition-all cursor-pointer ${
                              currentTheme === 'system'
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                            }`}
                          >
                            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-3">
                              <Monitor className="w-5 h-5" />
                            </div>
                            <div className="font-black text-sm text-slate-900 dark:text-white">System Auto</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Syncs with OS preferences
                            </div>
                            {currentTheme === 'system' && (
                              <div className="mt-3 flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. LOGO & BRANDING */}
                    {item.id === 'logo' && (
                      <div className="space-y-4">
                        {logoSuccess && (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{logoSuccess}</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                          {/* Current Logo Preview */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shadow-xs">
                              <Logo155UASU className="w-16 h-16" customLogoUrl={customLogo} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {customLogo ? 'Custom Crest' : 'Official Crest'}
                            </span>
                          </div>

                          {/* Upload Actions */}
                          <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Update Unit Crest Logo
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Select any image (PNG, JPG, SVG) from your device. It will automatically apply across headers, footers, and official views.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                              <label className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload New Picture</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                />
                              </label>

                              {customLogo && (
                                <button
                                  type="button"
                                  onClick={handleResetLogo}
                                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore Default Crest</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. ADMIN PASSCODE & SECURITY */}
                    {item.id === 'security' && (
                      <div className="space-y-4">
                        {role !== 'ADMIN' ? (
                          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Lock className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                  Admin Authentication Required
                                </div>
                                <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                                  Login with the master passcode to configure security settings and database operations.
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenAdminLogin();
                              }}
                              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                            >
                              Login as Admin
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleUpdatePasscode} className="space-y-4">
                            {passcodeSuccess && (
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>{passcodeSuccess}</span>
                              </div>
                            )}

                            {passcodeError && (
                              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-300 font-bold flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                <span>{passcodeError}</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  Current Passcode:
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={currentPasscode}
                                  onChange={(e) => setCurrentPasscode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="••••"
                                  className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  New Passcode (4 Digits):
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={newPasscode}
                                  onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="••••"
                                  className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  Confirm New Passcode:
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={confirmPasscode}
                                  onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="••••"
                                  className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                type="submit"
                                disabled={isUpdatingPasscode}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                              >
                                {isUpdatingPasscode ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Updating...</span>
                                  </>
                                ) : (
                                  <>
                                    <KeyRound className="w-3.5 h-3.5" />
                                    <span>Update Passcode</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* 4. DATABASE BACKUP & RESTORE */}
                    {item.id === 'database' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Backup */}
                          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>Download JSON Backup</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Export complete personnel roster, leave records, TDY deployments, and configuration to an offline JSON backup file.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleDownloadBackup}
                              disabled={isBackingUp}
                              className="w-full py-2.5 px-3 text-xs font-bold text-slate-900 dark:text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                            >
                              {isBackingUp ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Download Complete Backup</span>
                            </button>
                          </div>

                          {/* Restore */}
                          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Restore Database</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Upload a previously generated backup JSON file to restore all airmen records and monthly assignments.
                              </p>
                            </div>

                            <label className="w-full py-2.5 px-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Backup JSON</span>
                              <input
                                type="file"
                                accept=".json"
                                onChange={handleRestoreFile}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {restoreStatus && (
                          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
                            <Info className="w-4 h-4 shrink-0 text-indigo-600" />
                            <span>{restoreStatus}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            System Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">Operational</span> • 155 UASU, BAF BASE ZHR
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
