const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

code = code.replace(
  "import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem, updateAppConfigHistoryItemActiveStatus, deleteAppConfigHistoryItem } from '../utils/appConfig';",
  "import { getAppConfig, saveAppConfig, AppConfig, getAppConfigHistory, addAppConfigHistory, AppConfigHistoryItem, updateAppConfigHistoryItemActiveStatus, deleteAppConfigHistoryItem, clearAppConfigHistory } from '../utils/appConfig';"
);

// Add Notice Clear Button
const noticeHistoryHeader = `<h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Notice History
                    </h3>`;
const newNoticeHistoryHeader = `<div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Notice History
                      </h3>
                      <button onClick={() => {
                        if (confirm('Are you sure you want to clear all history?')) {
                          clearAppConfigHistory();
                          setAppConfigHistory([]);
                        }
                      }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                        Clear All
                      </button>
                    </div>`;
code = code.replace(noticeHistoryHeader, newNoticeHistoryHeader);

// Add Maint Clear Button
const maintHistoryHeader = `<h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Maintenance History
                    </h3>`;
const newMaintHistoryHeader = `<div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" /> Maintenance History
                      </h3>
                      <button onClick={() => {
                        if (confirm('Are you sure you want to clear all history?')) {
                          clearAppConfigHistory();
                          setAppConfigHistory([]);
                        }
                      }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                        Clear All
                      </button>
                    </div>`;
code = code.replace(maintHistoryHeader, newMaintHistoryHeader);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
