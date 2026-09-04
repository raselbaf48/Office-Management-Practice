const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// 1. Add state for delete confirmation
const stateInsert = `  const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);`;
const stateReplacement = `  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);
  const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);`;
code = code.replace(stateInsert, stateReplacement);

// 2. Change onClick for delete button
const deleteBtn = `onClick={() => {
                          if (onMatrixChange && confirm('Are you sure you want to delete this duty?')) {
                            const newMatrix = matrix.filter((_, i) => i !== idx);
                            onMatrixChange(newMatrix);
                          }
                        }}`;
const newDeleteBtn = `onClick={() => setDeleteConfirmIdx(idx)}`;
code = code.replace(deleteBtn, newDeleteBtn);

// 3. Render the confirmation modal at the bottom of the component
const endRender = `    </div>
  );
}`;
const newEndRender = `      {deleteConfirmIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Delete Duty</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete this duty? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmIdx(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={() => {
                if (onMatrixChange && matrix) {
                  const newMatrix = matrix.filter((_, i) => i !== deleteConfirmIdx);
                  onMatrixChange(newMatrix);
                }
                setDeleteConfirmIdx(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(endRender, newEndRender);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
