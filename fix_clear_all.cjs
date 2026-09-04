const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

// Add clear all confirm state
const stateTarget = `  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);`;
const stateReplacement = `  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearAllConfirmType, setClearAllConfirmType] = useState<'NOTICE' | 'MAINTENANCE' | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

// Update Clear All onClick for Notice
const clearNoticeTarget = `                      <button onClick={() => {
                        if (confirm('Are you sure you want to clear all history?')) {
                          clearAppConfigHistory();
                          setAppConfigHistory([]);
                        }
                      }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">`;
const clearNoticeReplacement = `                      <button onClick={() => setClearAllConfirmType('NOTICE')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">`;
code = code.replace(clearNoticeTarget, clearNoticeReplacement);

// Update Clear All onClick for Maintenance
const clearMaintTarget = `                      <button onClick={() => {
                        if (confirm('Are you sure you want to clear all history?')) {
                          clearAppConfigHistory();
                          setAppConfigHistory([]);
                        }
                      }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">`;
const clearMaintReplacement = `                      <button onClick={() => setClearAllConfirmType('MAINTENANCE')} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">`;
code = code.replace(clearMaintTarget, clearMaintReplacement);

// Update the render logic for popup to handle clearAll
const popupTarget = `      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Delete Notice/Maintenance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete this history item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                confirmDeleteHistory(deleteConfirmId);
                setDeleteConfirmId(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}`;
      
const popupReplacement = `      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Delete History Item</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                confirmDeleteHistory(deleteConfirmId);
                setDeleteConfirmId(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
      {clearAllConfirmType && (
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
      
code = code.replace(popupTarget, popupReplacement);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
