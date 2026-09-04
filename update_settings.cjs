const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

// Add state for delete confirmation
const stateTarget = `  const [activeUsers, setActiveUsers] = useState<any[]>([]);`;
const stateReplacement = `  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);`;
code = code.replace(stateTarget, stateReplacement);

// Update handleDeleteHistory to handle the state logic
const deleteLogicTarget = `  const handleDeleteHistory = (id: string) => {
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
  };`;
const deleteLogicReplacement = `  const confirmDeleteHistory = (id: string) => {
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
  };`;
code = code.replace(deleteLogicTarget, deleteLogicReplacement);

// Replace button onClick
code = code.replace(/onClick=\{\(\) => handleDeleteHistory\(item.id\)\}/g, 'onClick={() => setDeleteConfirmId(item.id)}');

// Add popup markup before the last </div>
const renderTarget = `        </div>
      </div>
    </div>
  );
}`;
const renderReplacement = `        </div>
      </div>

      {deleteConfirmId && (
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
      )}
    </div>
  );
}`;
code = code.replace(renderTarget, renderReplacement);

fs.writeFileSync('src/components/SettingsModal.tsx', code);
