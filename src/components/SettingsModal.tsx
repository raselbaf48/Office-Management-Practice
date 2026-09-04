import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem, updateAppConfigHistoryItemActiveStatus, deleteAppConfigHistoryItem, clearAppConfigHistory } from '../utils/appConfig';
import { Megaphone, Wrench, Clock, Trash2 as TrashIcon, Power, PowerOff } from 'lucide-react';

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
  Shield,
  Smartphone,
  Laptop,
  Globe,
  ExternalLink,
  Save,
  Palette
, Activity} from 'lucide-react';
import {   Logo155UASU } from './Logo155UASU';
import {   UserManagementTab } from './UserManagementTab';
import {   UserRole, ThemePreference, DetailedUserLogin, UserLoginStatus, UserLoginRole, Rank, FlightName } from '../types';
import { getCustomDuties, saveCustomDuties, addCustomDuty, removeCustomDuty, CustomDutyConfig } from '../utils/customDuties';
import {   subscribeToActiveUsers, subscribeToLoginHistory } from '../services/presenceService';
import {   getLoginHistory, clearLoginHistory, UserLoginLog, getDetailedUsers, toggleUserLoginStatus, saveDetailedUsers, changeUserPassword, changeAdminPassword, changeUserRole, getCurrentUserSession } from '../utils/authSession';
import {   localDb, getSyncLogs, SyncLog } from '../services/localDatabase';

import { CustomDutiesTab } from './CustomDutiesTab';

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

type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appNotice' | 'appMaintenance' | 'duties';

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
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

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
  
    const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());
  const [appConfigHistory, setAppConfigHistory] = useState<AppConfigHistoryItem[]>([]);
  
  // Draft states for forms
  const formatDateForInput = (date: Date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };
  
  const [noticeDraft, setNoticeDraft] = useState({
    heading: '',
    message: '',
    isScheduled: false,
    startTime: formatDateForInput(new Date()),
    endTime: ''
  });
  
  const [maintDraft, setMaintDraft] = useState({
    message: '',
    isScheduled: false,
    startTime: formatDateForInput(new Date()),
    endTime: ''
  });
  
  useEffect(() => {
    setAppConfigHistory(getAppConfigHistory());
  }, []);
  
  const applyTimePreset = (setter: any, currentDraft: any, minutes: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60000);
    setter({
      ...currentDraft,
      isScheduled: true,
      startTime: formatDateForInput(start),
      endTime: formatDateForInput(end)
    });
  };
  
  const handleSaveNotice = () => {
    const updatedConfig = {
      ...appConfig,
      notice: {
        isActive: true,
        heading: noticeDraft.heading || 'Important Notice',
        message: noticeDraft.message,
        isScheduled: noticeDraft.isScheduled,
        startTime: noticeDraft.isScheduled ? noticeDraft.startTime : undefined,
        endTime: noticeDraft.isScheduled ? noticeDraft.endTime : undefined,
      }
    };
    saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    localStorage.removeItem('baf_dismissed_notice_sig');
    
    const history = addAppConfigHistory({
      type: 'NOTICE',
      heading: noticeDraft.heading || 'Important Notice',
      message: noticeDraft.message,
      startTime: noticeDraft.isScheduled ? noticeDraft.startTime : undefined,
      endTime: noticeDraft.isScheduled ? noticeDraft.endTime : undefined,
      isActive: true
    });
    setAppConfigHistory(history);
    
    // Reset draft
    setNoticeDraft({
      heading: '',
      message: '',
      isScheduled: false,
      startTime: formatDateForInput(new Date()),
      endTime: ''
    });
  };
  
  const handleSaveMaintenance = () => {
    const updatedConfig = {
      ...appConfig,
      maintenance: {
        isActive: true,
        message: maintDraft.message,
        isScheduled: maintDraft.isScheduled,
        startTime: maintDraft.isScheduled ? maintDraft.startTime : undefined,
        endTime: maintDraft.isScheduled ? maintDraft.endTime : undefined,
      }
    };
    saveAppConfig(updatedConfig);
    setAppConfig(updatedConfig);
    
    const history = addAppConfigHistory({
      type: 'MAINTENANCE',
      message: maintDraft.message,
      startTime: maintDraft.isScheduled ? maintDraft.startTime : undefined,
      endTime: maintDraft.isScheduled ? maintDraft.endTime : undefined,
      isActive: true
    });
    setAppConfigHistory(history);
    
    // Reset draft
    setMaintDraft({
      message: '',
      isScheduled: false,
      startTime: formatDateForInput(new Date()),
      endTime: ''
    });
  };
  
  const handleStopFeature = (type: 'NOTICE' | 'MAINTENANCE', historyId: string) => {
    if (type === 'NOTICE') {
      const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
      saveAppConfig(updatedConfig);
      setAppConfig(updatedConfig);
    } else {
      const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
      saveAppConfig(updatedConfig);
      setAppConfig(updatedConfig);
    }
    const history = updateAppConfigHistoryItemActiveStatus(historyId, false);
    setAppConfigHistory(history);
  };
  
  const confirmDeleteHistory = (id: string) => {
    const itemToDelete = appConfigHistory.find(item => item.id === id);
    if (itemToDelete) {
      if (itemToDelete.type === 'NOTICE' && appConfig.notice.isActive && appConfig.notice.message === itemToDelete.message) {
         const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
         saveAppConfig(updatedConfig);
         setAppConfig(updatedConfig);
      }
      if (itemToDelete.type === 'MAINTENANCE' && appConfig.maintenance.isActive && appConfig.maintenance.message === itemToDelete.message) {
         const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
         saveAppConfig(updatedConfig);
         setAppConfig(updatedConfig);
      }
    }
    const history = deleteAppConfigHistoryItem(id);
    setAppConfigHistory(history);
  };
  

  
  const [historySearch, setHistorySearch] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearAllConfirmType, setClearAllConfirmType] = useState<'NOTICE' | 'MAINTENANCE' | null>(null);
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
      setRestoreStatus('');
      setLoginHistory(getLoginHistory());
      setDetailedUsersList(getDetailedUsers());
      setActiveSection(null);
    }
  }, [isOpen]);

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
        setAdminPasscodeSuccess('Admin PIN successfully updated!');
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
    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appNotice',
      label: 'App Notice',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400'
    }, {
      id: 'appMaintenance',
      label: 'Maintenance Mode',
      icon: <Wrench className="w-5 h-5" />,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
    }] : []),
    { id: 'appearance', label: 'Theme & Appearance', icon: <Palette className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' },
    ...((role === 'SUPER_ADMIN' || role === 'ADMIN') ? [{ id: 'cloudsync', label: 'Database Cloud Sync', icon: <Cloud className="w-5 h-5" />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' }] : []),
    ...((role === 'SUPER_ADMIN' || role === 'ADMIN') ? [{ id: 'users', label: 'User Management', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950 dark:text-purple-400' }] : []),
    ...(role === 'SUPER_ADMIN' ? [{ id: 'duties', label: 'Custom Duties', icon: <Shield className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400' }] : []),
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
        <div className={`w-full sm:w-[30%] sm:max-w-[320px] bg-slate-50 dark:bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 ${mobileView === 'detail' ? 'hidden sm:flex' : 'flex'}`}>
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
          <div className="flex-col overflow-y-auto sm:flex-1 px-4 pb-4 sm:pb-6 gap-2 sm:gap-1 sm:space-y-1 scrollbar-hide">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  if (sec.id === 'users' && onOpenUserManagement) {
                    onOpenUserManagement();
                  } else {
                    setActiveSection(sec.id as SettingSection);
                    setMobileView('detail');
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
        <div className={`flex-1 bg-white dark:bg-[#1e293b] flex-col relative overflow-hidden ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1e293b]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileView('list')}
                className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {getSectionTitle(activeSection || 'appearance')}
              </h3>
            </div>
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
              
              
              
              
              {activeSection === 'appNotice' && role === 'SUPER_ADMIN' && (
                <div className="space-y-8 animate-fadeIn">
                  {appConfig.notice.isActive && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Notice is Currently Live</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              Active
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                            {appConfig.notice.heading ? `${appConfig.notice.heading}: ` : ''}{appConfig.notice.message}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
                          saveAppConfig(updatedConfig);
                          setAppConfig(updatedConfig);
                          const activeItem = appConfigHistory.find(i => i.type === 'NOTICE' && i.isActive);
                          if (activeItem) {
                            setAppConfigHistory(updateAppConfigHistoryItemActiveStatus(activeItem.id, false));
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                      >
                        <PowerOff className="w-3.5 h-3.5" /> Stop / Deactivate Notice
                      </button>
                    </div>
                  )}

                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish App Notice</h3>
                        <p className="text-xs text-slate-500">Show a popup notice to users when they login.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Heading</label>
                        <input 
                          type="text"
                          value={noticeDraft.heading} 
                          onChange={(e) => setNoticeDraft({ ...noticeDraft, heading: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white"
                          placeholder="e.g. Important Notice"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Notice Message</label>
                        <textarea 
                          value={noticeDraft.message} 
                          onChange={(e) => setNoticeDraft({ ...noticeDraft, message: e.target.value })}
                          rows={3} 
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:text-white resize-none"
                          placeholder="Enter the notice message here..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notice-schedule" checked={noticeDraft.isScheduled} onChange={(e) => setNoticeDraft({ ...noticeDraft, isScheduled: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                        <label htmlFor="notice-schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Schedule</label>
                      </div>
                      
                      {noticeDraft.isScheduled && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex gap-2">
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 30)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 30 Mins</button>
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 60)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 1 Hour</button>
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 120)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 2 Hours</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">Start Time (Default: Now)</label>
                              <input type="datetime-local" value={noticeDraft.startTime || ''} onChange={(e) => setNoticeDraft({ ...noticeDraft, startTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={noticeDraft.endTime || ''} onChange={(e) => setNoticeDraft({ ...noticeDraft, endTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={handleSaveNotice} disabled={!noticeDraft.message} className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                          <Megaphone className="w-4 h-4" /> Publish Notice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notice History */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Notice History
                      </h3>
                      <button onClick={() => setClearAllConfirmType('NOTICE')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                        Clear All
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigHistory.filter(i => i.type === 'NOTICE').length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No notice history available yet.</p>
                      ) : (
                        appConfigHistory.filter(i => i.type === 'NOTICE').map((item) => (
                          <div key={item.id} className={`p-4 rounded-xl border text-sm flex flex-col gap-3 ${item.isActive ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                  NOTICE
                                </span>
                                {item.isActive && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                <button onClick={() => setDeleteConfirmId(item.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete record">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              {item.heading && <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.heading}</h4>}
                              <p className={`${item.isActive ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{item.message}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {(item.startTime || item.endTime) ? (
                                  <div className="text-xs text-slate-500 bg-white dark:bg-slate-900/50 px-2 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'} - {item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No schedule (Manual)</span>
                                )}
                              </div>
                              
                              {item.isActive && (
                                <button onClick={() => handleStopFeature('NOTICE', item.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">
                                  <PowerOff className="w-3.5 h-3.5" /> Stop Notice
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appMaintenance' && role === 'SUPER_ADMIN' && (
                <div className="space-y-8 animate-fadeIn">
                  {appConfig.maintenance.isActive && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-300">Maintenance Mode is Active</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                              Live
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                            {appConfig.maintenance.message}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
                          saveAppConfig(updatedConfig);
                          setAppConfig(updatedConfig);
                          const activeItem = appConfigHistory.find(i => i.type === 'MAINTENANCE' && i.isActive);
                          if (activeItem) {
                            setAppConfigHistory(updateAppConfigHistoryItemActiveStatus(activeItem.id, false));
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                      >
                        <PowerOff className="w-3.5 h-3.5" /> Deactivate Maintenance
                      </button>
                    </div>
                  )}

                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Activate Maintenance Mode</h3>
                        <p className="text-xs text-slate-500">Temporarily close the app for regular users.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Maintenance Message</label>
                        <textarea 
                          value={maintDraft.message} 
                          onChange={(e) => setMaintDraft({ ...maintDraft, message: e.target.value })}
                          rows={3} 
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 dark:text-white resize-none"
                          placeholder="App is currently undergoing maintenance..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="maint-schedule" checked={maintDraft.isScheduled} onChange={(e) => setMaintDraft({ ...maintDraft, isScheduled: e.target.checked })} className="w-4 h-4 text-amber-600 rounded border-slate-300" />
                        <label htmlFor="maint-schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Schedule</label>
                      </div>
                      
                      {maintDraft.isScheduled && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex gap-2">
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 30)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 30 Mins</button>
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 60)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 1 Hour</button>
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 120)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 2 Hours</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">Start Time (Default: Now)</label>
                              <input type="datetime-local" value={maintDraft.startTime || ''} onChange={(e) => setMaintDraft({ ...maintDraft, startTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={maintDraft.endTime || ''} onChange={(e) => setMaintDraft({ ...maintDraft, endTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={handleSaveMaintenance} disabled={!maintDraft.message} className="disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                          <Wrench className="w-4 h-4" /> Activate Maintenance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance History */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Maintenance History
                      </h3>
                      <button onClick={() => setClearAllConfirmType('MAINTENANCE')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                        Clear All
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigHistory.filter(i => i.type === 'MAINTENANCE').length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No maintenance history available yet.</p>
                      ) : (
                        appConfigHistory.filter(i => i.type === 'MAINTENANCE').map((item) => (
                          <div key={item.id} className={`p-4 rounded-xl border text-sm flex flex-col gap-3 ${item.isActive ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/50 shadow-md ring-1 ring-amber-500/20' : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  MAINTENANCE
                                </span>
                                {item.isActive && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                <button onClick={() => setDeleteConfirmId(item.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete record">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className={`${item.isActive ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{item.message}</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {(item.startTime || item.endTime) ? (
                                  <div className="text-xs text-slate-500 bg-white dark:bg-slate-900/50 px-2 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'} - {item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No schedule (Manual)</span>
                                )}
                              </div>
                              
                              {item.isActive && (
                                <button onClick={() => handleStopFeature('MAINTENANCE', item.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">
                                  <PowerOff className="w-3.5 h-3.5" /> Stop Maintenance
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              
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

          {activeSection === 'duties' && role === 'SUPER_ADMIN' && (
            <CustomDutiesTab />
          )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  

                  {/* Passwords */}
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                    
                    {/* Portal PIN Item */}
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

                    {/* Admin PIN Item */}
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
                            <input type="password" placeholder="Current Admin PIN" value={adminCurrentPasscode} onChange={e => setAdminCurrentPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="New Admin PIN" value={adminNewPasscode} onChange={e => setAdminNewPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="Confirm Admin PIN" value={adminConfirmPasscode} onChange={e => setAdminConfirmPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
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

        {/* Delete Single History Item Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Delete Record?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this record from history? If this notice or maintenance is currently live, it will also be stopped.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    confirmDeleteHistory(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {clearAllConfirmType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Clear All {clearAllConfirmType === 'NOTICE' ? 'Notices' : 'Maintenance Records'}?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This will delete all {clearAllConfirmType === 'NOTICE' ? 'notice' : 'maintenance'} history items and immediately deactivate any live {clearAllConfirmType === 'NOTICE' ? 'notice' : 'maintenance'} popup.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setClearAllConfirmType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (clearAllConfirmType === 'NOTICE') {
                      const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false, message: '' } };
                      saveAppConfig(updatedConfig);
                      setAppConfig(updatedConfig);
                    } else {
                      const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false, message: '' } };
                      saveAppConfig(updatedConfig);
                      setAppConfig(updatedConfig);
                    }
                    const remaining = appConfigHistory.filter(i => i.type !== clearAllConfirmType);
                    localStorage.setItem('baf_app_config_history', JSON.stringify(remaining));
                    setAppConfigHistory(remaining);
                    setClearAllConfirmType(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};
