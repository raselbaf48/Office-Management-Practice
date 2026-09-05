const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("AssignLeaveTab")) {
  const imports = `
import { AssignLeaveTab } from './AssignLeaveTab';
import { AssignTdyTab } from './AssignTdyTab';
import { AssignDeploymentTab } from './AssignDeploymentTab';
`;
  content = content.replace("import { FlightDutyRatioModal } from './FlightDutyRatioModal';", "import { FlightDutyRatioModal } from './FlightDutyRatioModal';" + imports);
}

// We need to add activeTab state to AssignDutyModal
if (!content.includes("activeModalTab")) {
  const stateInjection = `  const [activeModalTab, setActiveModalTab] = useState<'Duty' | 'Leave' | 'TDY' | 'Deployment'>('Duty');\n  const [showRatiosModal, setShowRatiosModal] = useState(false);`;
  content = content.replace("const [showRatiosModal, setShowRatiosModal] = useState(false);", stateInjection);
}

// Now replace the modal header and form structure
// Let's find the header.
const headerSearch = `<h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              {onlyIdac ? 'Assign IDAC Duty' : 'Interactive Duty Assignment'}
            </h2>`;

const newHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
                Assign Activity
              </h2>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['Duty', 'Leave', 'TDY', 'Deployment'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveModalTab(tab as any)}
                    className={\`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors \${activeModalTab === tab ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}\`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>`;

if (content.includes(headerSearch)) {
  content = content.replace(headerSearch, newHeader);
  
  // Now wrap the entire form logic with condition for 'Duty'
  const formStart = `{/* Main Modal Content */}`;
  
  const formEnd = `</form>
          </div>
        </div>`;
        
  // Since wrapping a massive block via string replacement might fail if not careful, let's do it using exact markers.
  // The content of the modal body is essentially what follows `{/* Main Modal Content */}` up to `</form>`
  
  // Wait, an easier way is to just conditionally render the form and the new tabs.
  
  const formTagStart = `<form onSubmit={handleSubmit} className="flex flex-col h-[calc(85vh-150px)]">`;
  const formTagEnd = `</form>`;
  
  const newFormTagStart = `
          {activeModalTab === 'Leave' && <AssignLeaveTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); onClose(); }} />}
          {activeModalTab === 'TDY' && <AssignTdyTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); onClose(); }} />}
          {activeModalTab === 'Deployment' && <AssignDeploymentTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); onClose(); }} />}
          
          <div style={{ display: activeModalTab === 'Duty' ? 'block' : 'none' }}>
          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(85vh-150px)]">`;
          
  const newFormTagEnd = `</form></div>`;
  
  content = content.replace(formTagStart, newFormTagStart);
  content = content.replace(formTagEnd, newFormTagEnd);
  
  fs.writeFileSync(file, content);
  console.log("Updated AssignDutyModal.tsx successfully.");
} else {
  console.log("Failed to find headerSearch string.");
}
