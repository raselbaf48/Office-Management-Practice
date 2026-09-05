const fs = require('fs');
let file = 'src/components/DutyRatioConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add removeCustomDuty import
if (!code.includes("removeCustomDuty")) {
  code = code.replace("import { addCustomDuty, CustomDutyConfig } from '../utils/customDuties';", "import { addCustomDuty, CustomDutyConfig, removeCustomDuty } from '../utils/customDuties';");
}

const oldDelete = `              <button onClick={() => {
                if (onMatrixChange && matrix) {
                  const newMatrix = matrix.filter((_, i) => i !== deleteConfirmIdx);
                  onMatrixChange(newMatrix);
                }
                setDeleteConfirmIdx(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>`;

const newDelete = `              <button onClick={() => {
                if (onMatrixChange && matrix && deleteConfirmIdx !== null) {
                  const dutyToDelete = matrix[deleteConfirmIdx];
                  if (dutyToDelete) {
                    // Try to remove from custom duties if it's a custom duty
                    removeCustomDuty(dutyToDelete.dutyCode);
                  }
                  const newMatrix = matrix.filter((_, i) => i !== deleteConfirmIdx);
                  onMatrixChange(newMatrix);
                }
                setDeleteConfirmIdx(null);
              }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">Delete</button>`;

if (code.includes('matrix.filter((_, i) => i !== deleteConfirmIdx)')) {
   code = code.replace(oldDelete, newDelete);
   fs.writeFileSync(file, code);
   console.log('Fixed duty deletion');
} else {
   console.log('Could not find delete block');
}
