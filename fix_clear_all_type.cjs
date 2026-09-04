const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

const popupTarget = `      {clearAllConfirmType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Clear All History</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to clear all history? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setClearAllConfirmType(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                clearAppConfigHistory();
                setAppConfigHistory([]);
                setClearAllConfirmType(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Clear All</button>
            </div>
          </div>
        </div>
      )}`;
      
const popupReplacement = `      {clearAllConfirmType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Clear {clearAllConfirmType === 'NOTICE' ? 'Notice' : 'Maintenance'} History</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to clear all {clearAllConfirmType === 'NOTICE' ? 'notice' : 'maintenance'} history? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setClearAllConfirmType(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                const remaining = appConfigHistory.filter(i => i.type !== clearAllConfirmType);
                localStorage.setItem('baf_app_config_history', JSON.stringify(remaining));
                setAppConfigHistory(remaining);
                setClearAllConfirmType(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Clear All</button>
            </div>
          </div>
        </div>
      )}`;
      
code = code.replace(popupTarget, popupReplacement);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
