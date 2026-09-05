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
  const stateInjection = `  const [activeModalTab, setActiveModalTab] = useState<'Duty' | 'Leave' | 'TDY' | 'Deployment'>('Duty');\n  const [showRatioModal, setShowRatioModal] = useState<boolean>(false);`;
  content = content.replace("const [showRatioModal, setShowRatioModal] = useState<boolean>(false);", stateInjection);
}

const headerBlockStart = `<div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">`;
const headerBlockEnd = `          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>`;

if (content.includes(headerBlockEnd)) {
  const customTabsHtml = `          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
  content = content.replace(headerBlockEnd, customTabsHtml);
  
  // Close the div correctly at the end.
  const closingDiv = `        {showRatioModal && (
          <FlightDutyRatioModal
            isOpen={showRatioModal}
            onClose={() => setShowRatioModal(false)}
            selectedDate={fromDate}
          />
        )}
      </div>
    </div>
  );
};`;
  const newClosingDiv = `        {showRatioModal && (
          <FlightDutyRatioModal
            isOpen={showRatioModal}
            onClose={() => setShowRatioModal(false)}
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
  console.log("Failed to find headerBlockEnd string.");
}

