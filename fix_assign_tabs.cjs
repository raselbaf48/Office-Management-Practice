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

if (!content.includes("activeModalTab")) {
  const stateInjection = `  const [activeModalTab, setActiveModalTab] = useState<'Duty' | 'Leave' | 'TDY' | 'Deployment'>('Duty');\n  const [showRatiosModal, setShowRatiosModal] = useState(false);`;
  content = content.replace("const [showRatiosModal, setShowRatiosModal] = useState(false);", stateInjection);
}

const headerBlockStart = `<div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">`;
const newHeaderBlock = `<div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0 gap-4">
          <div className="flex items-center space-x-3">
            <div className={\`p-2 rounded-xl text-white shadow-md \${onlyIdac ? 'bg-teal-600' : 'bg-emerald-600'}\`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {onlyIdac ? 'IDA Center Duty Assignment' : 'Assign Duty / Activity'}
                </h2>
                <span className={\`px-2 py-0.5 rounded-full text-[11px] font-black border \${
                  onlyIdac 
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }\`}>
                  Instant Auto-Save
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {onlyIdac
                  ? 'Click IDAC shift and airman below to assign directly. Synchronized with Dashboard & Matrix.'
                  : 'Assign Duty, Leave, TDY, or Deployment.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto pr-8">
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

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>`;

// Replace from `<div className="flex items-start justify-between border-b...` until the end of the header block that contains the close button.
// Actually, it's easier to just inject the tabs below the header.
const closeButtonHtml = `          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>`;

if (content.includes(closeButtonHtml)) {
  const customTabsHtml = `          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['Duty', 'Leave', 'TDY', 'Deployment'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveModalTab(tab as any)}
              className={\`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors flex-1 text-center \${activeModalTab === tab ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}\`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {activeModalTab === 'Leave' && <AssignLeaveTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); else if (onRefreshParadeData) onRefreshParadeData(); onClose(); }} />}
        {activeModalTab === 'TDY' && <AssignTdyTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); else if (onRefreshParadeData) onRefreshParadeData(); onClose(); }} />}
        {activeModalTab === 'Deployment' && <AssignDeploymentTab airmen={airmen} onClose={onClose} onSuccess={() => { if(onSuccess) onSuccess(); else if (onRefreshParadeData) onRefreshParadeData(); onClose(); }} />}
        
        <div style={{ display: activeModalTab === 'Duty' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
`;
  content = content.replace(closeButtonHtml, customTabsHtml);
  
  // Now we need to close that <div style={{display...}}> at the very end of the modal body
  // Before `      </div>\n    </div>\n  );\n};`
  
  const closingDiv = `        {showRatiosModal && (
          <FlightDutyRatioModal
            isOpen={showRatiosModal}
            onClose={() => setShowRatiosModal(false)}
            selectedDate={fromDate}
          />
        )}
      </div>
    </div>
  );
};`;
  const newClosingDiv = `        {showRatiosModal && (
          <FlightDutyRatioModal
            isOpen={showRatiosModal}
            onClose={() => setShowRatiosModal(false)}
            selectedDate={fromDate}
          />
        )}
        </div>
      </div>
    </div>
  );
};`;
  content = content.replace(closingDiv, newClosingDiv);

  fs.writeFileSync(file, content);
  console.log("Updated AssignDutyModal tabs successfully.");
} else {
  console.log("Failed to find closeButtonHtml string.");
}

