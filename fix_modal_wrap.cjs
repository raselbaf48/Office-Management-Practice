const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target = `  return (
    <div className="space-y-6">
      {/* PRINT STYLES */}
      <style>{\`
        @media print {`;

const replace = `  if (isOpen === false) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible printable-modal-overlay">
    <div className="space-y-6 bg-white w-full max-w-[1400px] print:w-auto mx-auto border border-slate-300 rounded-xl shadow-2xl print:border-none print:rounded-none print:shadow-none p-4">
      <div className="flex justify-between items-center print:hidden border-b pb-3 border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Print Preview</h2>
        <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      {/* PRINT STYLES */}
      <style>{\`
        @media print {`;

code = code.replace(target, replace);

const endTarget2 = `        }}
      />
    </div>
  );
};`;
const endReplace2 = `        }}
      />
    </div>
    </div>
    </div>
  );
};`;

code = code.replace(endTarget2, endReplace2);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Fixed modal wrap');
