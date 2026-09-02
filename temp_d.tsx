
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud,
  Server,

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
  ChevronRight,
  ArrowLeft,
  Info,
  Image as ImageIcon,
  RotateCcw,
  History,
  Search,
  Trash2,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  ExternalLink,
  Save,
  Palette
} from 'lucide-react';
import { Logo155UASU } from './Logo155UASU';
import { UserRole, ThemePreference, DetailedUserLogin, UserLoginStatus, UserLoginRole } from '../types';
import { subscribeToActiveUsers, subscribeToLoginHistory } from '../services/presenceService';
import { getLoginHistory, clearLoginHistory, UserLoginLog, getDetailedUsers, toggleUserLoginStatus, saveDetailedUsers, changeUserPassword, changeAdminPassword, changeUserRole, getCurrentUserSession } from '../utils/authSession';
import { localDb, getSyncLogs, SyncLog } from '../services/localDatabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onOpenAdminLogin: () => void;
  
  onOpenUserManagement?: () => void;
  onRosterUpdated?: () => void;
}

type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onOpenUserManagement,
  isOpen,
  onClose,
  role,
  currentTheme,
  onThemeChange,
  onOpenAdminLogin,
  onRosterUpdated,
}) => {
  const [activeSection, setActiveSection] = useState<SettingSection | null>(null);

  // Logo Change State
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('baf_custom_logo'));
  const [logoSuccess, setLogoSuccess] = useState<string>('');

  // Security Tab State
  const [adminCurrentPasscode, setAdminCurrentPasscode] = useState('');
  const [adminNewPasscode, setAdminNewPasscode] = useState('');
  const [adminConfirmPasscode, setAdminConfirmPasscode] = useState('');
  const [adminPasscodeError, setAdminPasscodeError] = useState('');
  const [adminPasscodeSuccess, setAdminPasscodeSuccess] = useState('');
  const [isUpdatingAdminPasscode, setIsUpdatingAdminPasscode] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [isUpdatingPasscode, setIsUpdatingPasscode] = useState(false);

  
  const [syncLogsState, setSyncLogsState] = useState<SyncLog[]>([]);
  useEffect(() => {
    if (isOpen) {
      setSyncLogsState(getSyncLogs());
    }
  }, [isOpen]);
  useEffect(() => {
    const handleSyncLog = (e: any) => {
      setSyncLogsState(e.detail);
    };
    window.addEventListener('baf_sync_logs_updated', handleSyncLog);
    return () => window.removeEventListener('baf_sync_logs_updated', handleSyncLog);
  }, []);

  // Login History State
  const [loginHistory, setLoginHistory] = useState<UserLoginLog[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [realtimeHistory, setRealtimeHistory] = useState<any[]>([]);

  // Detailed Users State
  const [detailedUsersList, setDetailedUsersList] = useState<DetailedUserLogin[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState<string>('');

  // Database Backup State
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  useEffect(() => {
    if (true) {
      const unsubUsers = subscribeToActiveUsers((users) => {
        setActiveUsers(users);
      });
      const unsubHistory = subscribeToLoginHistory((logs) => {
        setRealtimeHistory(logs);
      });
      return () => {
        unsubUsers();
        unsubHistory();
      };
    }
  }, [role]);

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
      setLoginHistory(getLoginHistory());
      setDetailedUsersList(getDetailedUsers());
      setActiveSection(null);
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

  

  const handleUpdateAdminPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasscodeError('');
    setAdminPasscodeSuccess('');

    if (!adminCurrentPasscode) {
      setAdminPasscodeError('Please enter your current admin password.');
      return;
    }
    if (!adminNewPasscode) {
      setAdminPasscodeError('Please enter a new admin password.');
      return;
    }
    if (adminNewPasscode !== adminConfirmPasscode) {
      setAdminPasscodeError('New admin password and confirm password do not match.');
      return;
    }

    setIsUpdatingAdminPasscode(true);
    try {
      const session = getCurrentUserSession();
      if (!session) {
        setAdminPasscodeError('You are not logged in.');
        return;
      }
      
      const res = changeAdminPassword(session.bdNo, adminCurrentPasscode, adminNewPasscode, false);
      
      if (res.success) {
        setAdminPasscodeSuccess('Admin Password successfully updated!');
        setAdminCurrentPasscode('');
        setAdminNewPasscode('');
        setAdminConfirmPasscode('');
        setTimeout(() => {
          onClose(); // Auto-close on success
        }, 1000);
      } else {
        setAdminPasscodeError(res.message);
      }
    } catch (err: any) {
      setAdminPasscodeError('Error updating admin password.');
    } finally {
      setIsUpdatingAdminPasscode(false);
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (!currentPasscode) {
      setPasscodeError('Please enter your current password.');
      return;
    }
    if (!newPasscode) {
      setPasscodeError('Please enter a new password.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeError('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPasscode(true);
    try {
      const session = getCurrentUserSession();
      if (!session) {
        setPasscodeError('You are not logged in.');
        return;
      }
      
      const res = changeUserPassword(session.bdNo, currentPasscode, newPasscode, false);
      
      if (res.success) {
        setPasscodeSuccess('Password successfully updated!');
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setPasscodeError(res.message);
      }
    } catch (err: any) {
      setPasscodeError('Error updating password.');
    } finally {
      setIsUpdatingPasscode(false);
    }
  };


  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    try {
      const backupData = await localDb.exportDatabase();
      const backupJson = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `155_UASU_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Backup failed:', err);
      alert('Failed to generate backup: ' + err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('WARNING: Restoring will OVERWRITE the current database completely. This action cannot be undone. Are you sure you want to proceed?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const backupData = JSON.parse(jsonStr);
        setRestoreStatus('Importing backup to local database...');
        
        await localDb.restoreDatabase(backupData);
        setRestoreStatus('✅ Database restore complete! Please refresh the page to apply changes.');
        if (onRosterUpdated) {
          onRosterUpdated();
        }
      } catch (err: any) {
        console.error('Restore failed:', err);
        setRestoreStatus(`❌ Error restoring database: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.onerror = () => {
      setRestoreStatus('❌ Error reading the file.');
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

    const [editingPasswordType, setEditingPasswordType] = useState<'portal' | 'admin' | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    if (!activeSection) {
      setActiveSection('appearance');
    }
  }, [activeSection]);
const sections = [
    { id: 'appearance', label: 'Theme & Appearance', icon: <Palette className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' },
    ...(role === 'SUPER_ADMIN' ? [{ id: 'cloudsync', label: 'Database Cloud Sync', icon: <Cloud className="w-5 h-5" />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' }] : []),
    ...(role === 'SUPER_ADMIN' ? [{ id: 'users', label: 'User Management', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950 dark:text-purple-400' }] : []),
    { id: 'security', label: 'Security & Passcode', icon: <Lock className="w-5 h-5" />, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950 dark:text-amber-400' },
    ...(role === 'SUPER_ADMIN' ? [{ id: 'database', label: 'Database Backup', icon: <Database className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400' }] : []),
    ...(role === 'SUPER_ADMIN' ? [{ id: 'history', label: 'Login History', icon: <History className="w-5 h-5" />, color: 'text-sky-500 bg-sky-100 dark:bg-sky-950 dark:text-sky-400' }] : []),
  ];

  const getSectionTitle = (id: SettingSection) => {
    return sections.find(s => s.id === id)?.label || 'Settings';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8">
      {/* 2-Column Split View Desktop / Fullscreen Mobile */}
      <div className="w-full max-w-6xl h-[85vh] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row overflow-hidden relative">
        
        {/* Left Column: Tabs Navigation (approx 30%) */}
        <div className="w-full sm:w-[30%] sm:max-w-[320px] bg-slate-50 dark:bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-6 pb-2 flex items-center justify-between sm:justify-start">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-500" />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as SettingSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                  activeSection === sec.id
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent font-medium'
                }`}
              >
                <div className={`${activeSection === sec.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {sec.icon}
                </div>
                <span className="text-sm">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Tab Content (approx 70%) */}
        <div className="flex-1 bg-white dark:bg-[#1e293b] flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="hidden sm:flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1e293b]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {getSectionTitle(activeSection || 'appearance')}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Display Theme</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => onThemeChange('system')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === 'system' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}`}
                      >
                        <Monitor className={`w-6 h-6 ${currentTheme === 'system' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-bold ${currentTheme === 'system' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>System</span>
                      </button>
                      <button
                        onClick={() => onThemeChange('light')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}`}
                      >
                        <Sun className={`w-6 h-6 ${currentTheme === 'light' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-bold ${currentTheme === 'light' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>Light</span>
                      </button>
                      <button
                        onClick={() => onThemeChange('dark')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}`}
                      >
                        <Moon className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-bold ${currentTheme === 'dark' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>Dark</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Custom Logo URL</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={customLogo || ''}
                        onChange={(e) => setCustomLogo(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:text-white" />
                      <button
                        onClick={handleSaveLogo}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                    {logoSuccess && <p className="text-emerald-500 text-xs mt-2 font-bold">{logoSuccess}</p>}
                  </div>
                </div>
              )}


{activeSection === 'database' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Firebase Cloud Sync
                    </h3>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                      High-speed real-time persistence powered by Firebase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localDb.syncFromFirebase();
                      alert('Firebase sync triggered!');
                    }}
                    className="self-start px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-200 dark:bg-emerald-800/60 hover:bg-emerald-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Now</span>
                  </button>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Download className="w-4 h-4 text-amber-500" />
                    Export Local Backup
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download complete roster, TDY, and leave records as a JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isBackingUp}
                  className="w-full py-3 text-sm font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex justify-center items-center gap-2 cursor-pointer"
                >
                  {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download JSON Backup
                </button>
              </div>

              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    Restore Database
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a JSON backup file. WARNING: This will overwrite current data.
                  </p>
                </div>
                <label className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex justify-center items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload JSON Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>
              
              {restoreStatus && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  {restoreStatus}
                </div>
              )}
            </div>
          )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
