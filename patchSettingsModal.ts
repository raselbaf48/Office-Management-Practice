import fs from 'fs';

const path = 'src/components/SettingsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { getAppConfig, saveAppConfig, AppConfig }")) {
  code = code.replace(
    "import { localDb, getSyncLogs, SyncLog } from '../services/localDatabase';",
    "import { localDb, getSyncLogs, SyncLog } from '../services/localDatabase';\nimport { getAppConfig, saveAppConfig, AppConfig } from '../utils/appConfig';\nimport { Megaphone, Wrench } from 'lucide-react';"
  );
  
  // Update SettingSection type
  code = code.replace(
    "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history';",
    "type SettingSection = 'appearance' | 'cloudsync' | 'users' | 'security' | 'database' | 'history' | 'appManagement';"
  );
  
  // Add state for AppConfig
  const stateInsertPoint = "const [historySearch, setHistorySearch] = useState<string>('');";
  const stateVars = `
  const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());
  
  const handleSaveNotice = () => {
    saveAppConfig(appConfig);
  };
  
  const handleSaveMaintenance = () => {
    saveAppConfig(appConfig);
  };
  
  const [historySearch, setHistorySearch] = useState<string>('');`;
  code = code.replace(stateInsertPoint, stateVars);
  
  // Add icon and section entry
  const sectionsVarMatch = /const sections = \[\s*\{ id: 'appearance',/m;
  const sectionsVarInsertion = `const sections = [
    ...(role === 'SUPER_ADMIN' ? [{
      id: 'appManagement',
      label: 'App Management',
      icon: <Megaphone className="w-5 h-5" />
    }] : []),
    { id: 'appearance',`;
  code = code.replace(sectionsVarMatch, sectionsVarInsertion);
  
  // Add case in getSectionTitle
  code = code.replace(
    "case 'history': return 'Login History';",
    "case 'history': return 'Login History';\n      case 'appManagement': return 'App Management';"
  );
  
  // Add the App Management UI
  const settingsTabUI = `{activeSection === 'appearance' && (`;
  const appManagementUI = `
              {activeSection === 'appManagement' && role === 'SUPER_ADMIN' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Notice Section */}
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">App Notice</h3>
                          <p className="text-xs text-slate-500">Show a popup notice to users when they login.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={appConfig.notice.isActive} onChange={(e) => setAppConfig({ ...appConfig, notice: { ...appConfig.notice, isActive: e.target.checked } })} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    {appConfig.notice.isActive && (
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Notice Message</label>
                          <textarea 
                            value={appConfig.notice.message} 
                            onChange={(e) => setAppConfig({ ...appConfig, notice: { ...appConfig.notice, message: e.target.value } })}
                            rows={3} 
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:text-white resize-none"
                            placeholder="Enter the notice message here..."
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="notice-schedule" checked={appConfig.notice.isScheduled} onChange={(e) => setAppConfig({ ...appConfig, notice: { ...appConfig.notice, isScheduled: e.target.checked } })} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                          <label htmlFor="notice-schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Schedule</label>
                        </div>
                        
                        {appConfig.notice.isScheduled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">Start Time</label>
                              <input type="datetime-local" value={appConfig.notice.startTime || ''} onChange={(e) => setAppConfig({ ...appConfig, notice: { ...appConfig.notice, startTime: e.target.value } })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={appConfig.notice.endTime || ''} onChange={(e) => setAppConfig({ ...appConfig, notice: { ...appConfig.notice, endTime: e.target.value } })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end pt-2">
                          <button onClick={handleSaveNotice} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                            Save Notice Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Maintenance Section */}
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-700/50 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 flex items-center justify-center">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">Maintenance Mode</h3>
                          <p className="text-xs text-amber-700 dark:text-amber-400">Temporarily close the app for regular users.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={appConfig.maintenance.isActive} onChange={(e) => setAppConfig({ ...appConfig, maintenance: { ...appConfig.maintenance, isActive: e.target.checked } })} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                    
                    {appConfig.maintenance.isActive && (
                      <div className="space-y-4 pt-4 border-t border-amber-200/50 dark:border-amber-700/30">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Maintenance Message</label>
                          <textarea 
                            value={appConfig.maintenance.message} 
                            onChange={(e) => setAppConfig({ ...appConfig, maintenance: { ...appConfig.maintenance, message: e.target.value } })}
                            rows={3} 
                            className="w-full bg-white dark:bg-slate-900/50 border border-amber-200 dark:border-amber-700/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 dark:text-white resize-none"
                            placeholder="App is currently undergoing maintenance..."
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="maint-schedule" checked={appConfig.maintenance.isScheduled} onChange={(e) => setAppConfig({ ...appConfig, maintenance: { ...appConfig.maintenance, isScheduled: e.target.checked } })} className="w-4 h-4 text-amber-600 rounded border-slate-300" />
                          <label htmlFor="maint-schedule" className="text-sm font-medium text-amber-800 dark:text-amber-200">Enable Schedule</label>
                        </div>
                        
                        {appConfig.maintenance.isScheduled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-amber-700 dark:text-amber-400">Start Time</label>
                              <input type="datetime-local" value={appConfig.maintenance.startTime || ''} onChange={(e) => setAppConfig({ ...appConfig, maintenance: { ...appConfig.maintenance, startTime: e.target.value } })} className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-amber-700 dark:text-amber-400">End Time</label>
                              <input type="datetime-local" value={appConfig.maintenance.endTime || ''} onChange={(e) => setAppConfig({ ...appConfig, maintenance: { ...appConfig.maintenance, endTime: e.target.value } })} className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end pt-2">
                          <button onClick={handleSaveMaintenance} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
                            Save Maintenance Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeSection === 'appearance' && (`;
  
  code = code.replace(settingsTabUI, appManagementUI);
  
  fs.writeFileSync(path, code);
}
