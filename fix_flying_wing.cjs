const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// Fix Table Borders
file = file.replace(/border border-black/g, 'border-[1.5px] border-black');

// Fix Prepared By Alignment
file = file.replace(
  /<div className="w-full mt-16 mb-4 flex justify-end text-xs">/g, 
  '<div className="w-full mt-16 mb-4 flex justify-start text-xs">'
);

// Fix Modals Theme - Add Disposal
file = file.replace(
  /<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-800 flex flex-col max-h-\[90vh\]">/,
  '<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]">'
);
file = file.replace(
  /<div className="p-4 border-b border-slate-100 flex justify-between items-center">/,
  '<div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">'
);
// Fix modal labels/inputs for Add Disposal
file = file.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
file = file.replace(/bg-slate-50 border border-slate-200/g, 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700');

// Fix Modals Theme - Prepared By
file = file.replace(
  /<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-slate-800 p-5">/,
  '<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-slate-800 dark:text-slate-100 p-5">'
);

// If isPrintMode is missing from props, add it
if (!file.includes('isPrintMode?: boolean')) {
  file = file.replace(
    /onClosePrepModal\?: \(\) => void;/,
    'onClosePrepModal?: () => void;\n  isPrintMode?: boolean;'
  );
  file = file.replace(
    /const FlyingWingStateView: React\.FC<FlyingWingStateViewProps> = \(\{ date, uasuStats, isAddModalOpen, onCloseAddModal, onOpenAddModal, isPrepModalOpen, onClosePrepModal \}\) => \{/,
    'const FlyingWingStateView: React.FC<FlyingWingStateViewProps> = ({ date, uasuStats, isAddModalOpen, onCloseAddModal, onOpenAddModal, isPrepModalOpen, onClosePrepModal, isPrintMode }) => {'
  );
}

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
