
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
import { localDb } from '../services/localDatabase';

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

type SettingSection = 'appearance' | 'logo' | 'users' | 'security' | 'database' | 'history';

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

  const sections = [
    { id: 'appearance', label: 'Theme & Appearance', icon: <Palette className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' },
    ...(role === 'SUPER_ADMIN' ? [{ id: 'logo', label: 'Unit Crest / Logo', icon: <ImageIcon className="w-5 h-5" />, color: 'text-rose-500 bg-rose-100 dark:bg-rose-950 dark:text-rose-400' }] : []),
    ...(role === 'SUPER_ADMIN' ? [{ id: 'users', label: 'User Management', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950 dark:text-purple-400' }] : []),
    { id: 'security', label: 'Security & Passcode', icon: <Lock className="w-5 h-5" />, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950 dark:text-amber-400' },
    ...(role === 'SUPER_ADMIN' ? [{ id: 'database', label: 'Database Backup', icon: <Database className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400' }] : []),
    ...(role === 'SUPER_ADMIN' ? [{ id: 'history', label: 'Login History', icon: <History className="w-5 h-5" />, color: 'text-sky-500 bg-sky-100 dark:bg-sky-950 dark:text-sky-400' }] : []),
  ];

  const getSectionTitle = (id: SettingSection) => {
    return sections.find(s => s.id === id)?.label || 'Settings';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden sm:p-6 sm:justify-center sm:items-center">
      {/* Modal Container for Desktop, Fullscreen for Mobile */}
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-slate-50 dark:bg-slate-950 sm:rounded-3xl sm:shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* App-like Top Header */}
        <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shrink-0 border-b border-slate-200 dark:border-slate-800">
          {activeSection ? (
            <button 
              onClick={() => setActiveSection(null)} 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={onClose} 
              className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold tracking-wide flex-1 pr-10">
            {activeSection ? getSectionTitle(activeSection) : 'Settings'}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* Main List View */}
          {!activeSection && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {sections.map((sec, idx) => (
                <div 
                  key={sec.id}
                  onClick={() => { if (sec.id === 'users' && onOpenUserManagement) { onOpenUserManagement(); } else { setActiveSection(sec.id as SettingSection); } }}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:bg-slate-100 ${idx !== sections.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${sec.color}`}>
                      {sec.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{sec.label}</span>
                  </div>
                  
                </div>
              ))}
            </div>
          )}

          
          {/* Section: Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Theme</p>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                
                <button
                  onClick={() => onThemeChange('system')}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentTheme === 'system' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-900'}`}>
                      <Monitor className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${currentTheme === 'system' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>System Default</span>
                  </div>
                  {currentTheme === 'system' && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                <button
                  onClick={() => onThemeChange('light')}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentTheme === 'light' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-900'}`}>
                      <Sun className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${currentTheme === 'light' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>Light Mode</span>
                  </div>
                  {currentTheme === 'light' && <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                </button>

                <button
                  onClick={() => onThemeChange('dark')}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentTheme === 'dark' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-900'}`}>
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-bold ${currentTheme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Dark Mode</span>
                  </div>
                  {currentTheme === 'dark' && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </button>

              </div>
            </div>
          )}

          {/* Section: Logo */}
          {activeSection === 'logo' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center">
                <div className="w-24 h-24 mb-4">
                  <Logo155UASU className="w-full h-full drop-shadow-md" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Current Unit Crest</p>
                <p className="text-xs text-slate-500 text-center mb-6">
                  {customLogo ? 'Using custom uploaded logo.' : 'Using default 155 UASU vector graphic.'}
                </p>

                <div className="flex w-full gap-3">
                  <label className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer text-center flex justify-center items-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload New</span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {customLogo && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="flex-1 py-2.5 px-3 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
                {logoSuccess && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 w-full flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {logoSuccess}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Users */}
          {activeSection === 'users' && role === 'SUPER_ADMIN' && (
            <div className="space-y-4">
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by BD No, Rank, Name, Flight..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white px-3 py-1 outline-none placeholder:text-slate-400"
                />
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {(() => {
                  const filteredUsers = detailedUsersList.filter(u => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      u.bdNo.toLowerCase().includes(q) ||
                      u.name.toLowerCase().includes(q) ||
                      u.rank.toLowerCase().includes(q) ||
                      u.flightName.toLowerCase().includes(q)
                    );
                  });

                  if (filteredUsers.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500">
                        <p className="text-xs font-bold">No users found.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                      {filteredUsers.map(u => (
                        <div key={u.bdNo} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {u.rank} {u.name}
                            </div>
                            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              BD/{u.bdNo} • {u.flightName}
                            </div>
                            <div className="mt-1 flex gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const next: UserLoginStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : u.status === 'SUSPENDED' ? 'DISABLED' : 'ACTIVE';
                              toggleUserLoginStatus(u.bdNo, next);
                              setDetailedUsersList(getDetailedUsers());
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors shadow-sm ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : u.status === 'SUSPENDED'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {u.status}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Section: Security */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-bold">Change Your Password</h3>
                </div>
                <form onSubmit={handleUpdatePasscode} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-400"
                      placeholder="****"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-400"
                      placeholder="****"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-400"
                      placeholder="****"
                    />
                  </div>

                  {passcodeError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      {passcodeError}
                    </div>
                  )}

                  {passcodeSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {passcodeSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingPasscode}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingPasscode ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
                  <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold">Change Admin Password</h3>
                  </div>
                  <form onSubmit={handleUpdateAdminPasscode} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Current Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminCurrentPasscode}
                        onChange={(e) => setAdminCurrentPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminNewPasscode}
                        onChange={(e) => setAdminNewPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Confirm New Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminConfirmPasscode}
                        onChange={(e) => setAdminConfirmPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>

                    {adminPasscodeError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {adminPasscodeError}
                      </div>
                    )}
                    
                    {adminPasscodeSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {adminPasscodeSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdatingAdminPasscode}
                      className="w-full py-3 px-4 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingAdminPasscode ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Update Admin Password</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Section: Database Backup */}
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

          {/* Section: History */}
                    {activeSection === 'history' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6">
              
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
                          {u.rank} {u.name} - ({u.page || 'Dashboard'}) - {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Normal User'}
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
                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex justify-between items-center">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          {log.rank} {log.name}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-bold uppercase tracking-wider">
                            {log.role === 'SUPER_ADMIN' ? 'Super Admin' : log.role === 'ADMIN' ? 'Admin' : 'Normal User'}
                          </span>
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          BD/{log.bdNo} • {log.flightName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
