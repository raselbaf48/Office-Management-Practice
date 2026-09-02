
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
, Activity} from 'lucide-react';
import {   Logo155UASU } from './Logo155UASU';
import {   UserManagementTab } from './UserManagementTab';
import {   UserRole, ThemePreference, DetailedUserLogin, UserLoginStatus, UserLoginRole } from '../types';
import {   subscribeToActiveUsers, subscribeToLoginHistory } from '../services/presenceService';
import {   getLoginHistory, clearLoginHistory, UserLoginLog, getDetailedUsers, toggleUserLoginStatus, saveDetailedUsers, changeUserPassword, changeAdminPassword, changeUserRole, getCurrentUserSession } from '../utils/authSession';
import {   localDb, getSyncLogs, SyncLog } from '../services/localDatabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  userFlight?: string;
  nominalAirmen: any[];
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onOpenAdminLogin: () => void;
  
  onOpenUserManagement?: () => void;
  onRosterUpdated?: () => void;
}

type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  nominalAirmen,
  onOpenUserManagement,
  isOpen,
  onClose,
  role,
  userFlight,
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
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<any>(null);

  // Detailed Users State
  const [detailedUsersList, setDetailedUsersList] = useState<DetailedUserLogin[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState<string>('');

  // Database Backup State
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [editingPasswordType, setEditingPasswordType] = useState<'portal' | 'admin' | null>(null);

  useEffect(() => {
    if (!activeSection) {
      setActiveSection('appearance');
    }
  }, [activeSection]);

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

  const handleSaveLogo = () => {
    if (customLogo) {
      localStorage.setItem('baf_custom_logo', customLogo);
      setLogoSuccess('Logo URL updated successfully.');
      window.dispatchEvent(new CustomEvent('baf_logo_updated', { detail: { logoUrl: customLogo } }));
    }
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

  const sections = [
    { id: 'appearance', label: 'Theme & Appearance', icon: <Palette className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' },
    ...((role === 'SUPER_ADMIN' || role === 'ADMIN') ? [{ id: 'cloudsync', label: 'Database Cloud Sync', icon: <Cloud className="w-5 h-5" />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' }] : []),
    ...((role === 'SUPER_ADMIN' || role === 'ADMIN') ? [{ id: 'users', label: 'User Management', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950 dark:text-purple-400' }] : []),
    { id: 'security', label: 'Security & Passcode', icon: <Lock className="w-5 h-5" />, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950 dark:text-amber-400' },
    ...((role === 'SUPER_ADMIN' || role === 'ADMIN') ? [{ id: 'database', label: 'Backup & Restore', icon: <Database className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400' }] : []),
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
          <div className="flex overflow-x-auto sm:flex-col sm:overflow-y-auto sm:flex-1 px-4 pb-4 sm:pb-6 gap-2 sm:gap-1 sm:space-y-1 scrollbar-hide">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  if (sec.id === 'users' && onOpenUserManagement) {
                    onOpenUserManagement();
                  } else {
                    setActiveSection(sec.id as SettingSection);
                  }
                }}
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


{activeSection === 'cloudsync' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                    <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Database Cloud Sync</h3>
                  <p className="text-xs text-slate-500 mt-1 text-center max-w-[250px]">
                    Manually push your local changes or pull updates from the central Firebase database.
                  </p>
                </div>

                <button
                  onClick={() => {
                    localDb.forceSave(); // Triggers push to firebase
                    localDb.syncFromFirebase(); // Triggers pull from firebase
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mb-6"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync Now</span>
                </button>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Recent Sync Logs</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {syncLogsState.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">No recent sync activity</p>
                    ) : (
                      syncLogsState.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {log.type === 'PUSH' ? 'Uploaded to Cloud' : log.type === 'PULL' ? 'Downloaded from Cloud' : 'Manual Sync'}
                              </span>
                              <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{log.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <div className="flex-1 h-full">
              <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />
            </div>
          )}




              {activeSection === 'security' && (
                <div className="space-y-6">
                  

                  {/* Passwords */}
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                    
                    {/* Portal Password Item */}
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">Portal Login Password</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used to access your account</p>
                        </div>
                      </div>
                      {editingPasswordType === 'portal' ? (
                        <form onSubmit={handleUpdatePasscode} className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                          <input type="password" placeholder="Current Password" value={currentPasscode} onChange={e => setCurrentPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          <input type="password" placeholder="New Password" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          <input type="password" placeholder="Confirm Password" value={confirmPasscode} onChange={e => setConfirmPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          {passcodeError && <span className="text-rose-500 text-xs">{passcodeError}</span>}
                          {passcodeSuccess && <span className="text-emerald-500 text-xs">{passcodeSuccess}</span>}
                          <div className="flex gap-2">
                            <button type="submit" disabled={isUpdatingPasscode} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5 text-sm font-bold transition-colors disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setEditingPasswordType(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg py-1.5 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setEditingPasswordType('portal')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          Update
                        </button>
                      )}
                    </div>

                    {/* Admin Password Item */}
                    {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                      <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Admin Access Password</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for elevated operations</p>
                          </div>
                        </div>
                        {editingPasswordType === 'admin' ? (
                          <form onSubmit={handleUpdateAdminPasscode} className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <input type="password" placeholder="Current Admin Password" value={adminCurrentPasscode} onChange={e => setAdminCurrentPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="New Admin Password" value={adminNewPasscode} onChange={e => setAdminNewPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="Confirm Admin Password" value={adminConfirmPasscode} onChange={e => setAdminConfirmPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            {adminPasscodeError && <span className="text-rose-500 text-xs">{adminPasscodeError}</span>}
                            {adminPasscodeSuccess && <span className="text-emerald-500 text-xs">{adminPasscodeSuccess}</span>}
                            <div className="flex gap-2">
                              <button type="submit" disabled={isUpdatingAdminPasscode} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-1.5 text-sm font-bold transition-colors disabled:opacity-50">Save</button>
                              <button type="button" onClick={() => setEditingPasswordType(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg py-1.5 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setEditingPasswordType('admin')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            Update
                          </button>
                        )}
                      </div>
                    )}

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



{activeSection === 'history' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6">
              
              {selectedHistoryUser ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 animate-fadeIn">
                  <div className="flex items-center justify-between mb-6">
                    <button 
                      onClick={() => setSelectedHistoryUser(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">User Activity</h3>
                    <div className="w-9"></div>
                  </div>

                  <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedHistoryUser.rank} {selectedHistoryUser.name}
                      </div>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {selectedHistoryUser.bdNo}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Timeline
                  </h4>
                  <div className="space-y-6">
                    <div className="relative pl-6 border-l-2 border-emerald-200 dark:border-emerald-900/50">
                      <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1 border-2 border-white dark:border-slate-800"></div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Logged In</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">System Login</p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(selectedHistoryUser.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                      <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1 border-2 border-white dark:border-slate-800"></div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">System Access</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Only View Dashboard</p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(new Date(selectedHistoryUser.timestamp).getTime() + 60000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Active Users Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      Currently Active ({activeUsers.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeUsers.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">No other active users</span>
                      ) : (
                        activeUsers.map(u => (
                          <div key={u.bdNo} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              {u.rank} {u.name} - ({u.page || 'Dashboard'}) - {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Realtime Login History Section */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search realtime logs..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white px-3 py-1 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto shadow-sm">
                    {(() => {
                      const filtered = realtimeHistory.filter(log => {
                        if (!historySearch.trim()) return true;
                        const q = historySearch.toLowerCase();
                        return (
                          log.bdNo?.toLowerCase().includes(q) ||
                          log.name?.toLowerCase().includes(q) ||
                          log.rank?.toLowerCase().includes(q) ||
                          log.flightName?.toLowerCase().includes(q)
                        );
                      });
                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-500">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold">No realtime login history found</p>
                          </div>
                        );
                      }
                      return filtered.map(log => (
                        <div 
                          key={log.id} 
                          onClick={() => setSelectedHistoryUser(log)}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                              {log.rank} {log.name}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-bold uppercase tracking-wider">
                                {log.role === 'SUPER_ADMIN' ? 'Super Admin' : log.role === 'ADMIN' ? 'Admin' : 'User'}
                              </span>
                            </div>
                            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              {log.bdNo} • {log.flightName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          )}            </div>
          </div>
        </div>
      
      
</div>
    </div>
  );
};
