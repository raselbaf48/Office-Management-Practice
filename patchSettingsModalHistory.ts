import fs from 'fs';

const path = 'src/components/SettingsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update imports
if (!code.includes("AppConfigHistoryItem")) {
  code = code.replace(
    "import { getAppConfig, saveAppConfig, AppConfig } from '../utils/appConfig';",
    "import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem } from '../utils/appConfig';"
  );
  
  // 2. Add state for appConfigHistory
  const stateInsertion = `
  const [appConfigHistory, setAppConfigHistory] = useState<AppConfigHistoryItem[]>([]);
  
  useEffect(() => {
    setAppConfigHistory(getAppConfigHistory());
  }, []);
  `;
  code = code.replace(
    "const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());",
    "const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig());\n" + stateInsertion
  );
  
  // 3. Update handlers
  const oldNoticeHandler = `const handleSaveNotice = () => {
    saveAppConfig(appConfig);
  };`;
  const newNoticeHandler = `const handleSaveNotice = () => {
    saveAppConfig(appConfig);
    if (appConfig.notice.isActive) {
      const history = addAppConfigHistory({
        type: 'NOTICE',
        message: appConfig.notice.message,
        startTime: appConfig.notice.isScheduled ? appConfig.notice.startTime : undefined,
        endTime: appConfig.notice.isScheduled ? appConfig.notice.endTime : undefined,
        isActive: true
      });
      setAppConfigHistory(history);
    }
  };`;
  code = code.replace(oldNoticeHandler, newNoticeHandler);
  
  const oldMaintHandler = `const handleSaveMaintenance = () => {
    saveAppConfig(appConfig);
  };`;
  const newMaintHandler = `const handleSaveMaintenance = () => {
    saveAppConfig(appConfig);
    if (appConfig.maintenance.isActive) {
      const history = addAppConfigHistory({
        type: 'MAINTENANCE',
        message: appConfig.maintenance.message,
        startTime: appConfig.maintenance.isScheduled ? appConfig.maintenance.startTime : undefined,
        endTime: appConfig.maintenance.isScheduled ? appConfig.maintenance.endTime : undefined,
        isActive: true
      });
      setAppConfigHistory(history);
    }
  };`;
  code = code.replace(oldMaintHandler, newMaintHandler);
  
  // 4. Add UI for history inside the App Management tab
  const historyUI = `
                  {/* History Section */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Notice & Maintenance History</h3>
                        <p className="text-xs text-slate-500">Log of previously activated notices and maintenance windows.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigHistory.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No history available yet.</p>
                      ) : (
                        appConfigHistory.map((item) => (
                          <div key={item.id} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm flex flex-col gap-2 relative">
                            <div className="flex items-center justify-between">
                              <span className={\`text-xs font-bold px-2 py-1 rounded-md \${item.type === 'NOTICE' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}\`}>
                                {item.type}
                              </span>
                              <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{item.message}</p>
                            {(item.startTime || item.endTime) && (
                              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mt-1 inline-block border border-slate-100 dark:border-slate-700">
                                <span className="font-semibold">Schedule:</span> {item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'} - {item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
  `;
  
  // Find the end of App Management UI
  const endOfAppManagement = `</div>
              )}
              
              {activeSection === 'appearance' && (`;
              
  code = code.replace(endOfAppManagement, historyUI + "\n              {activeSection === 'appearance' && (");
  
  fs.writeFileSync(path, code);
}
