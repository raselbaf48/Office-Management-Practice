const fs = require('fs');

function fixTabs() {
  let file = 'src/components/AirmanProfileModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Change interface AirmanProfileModalProps
  code = code.replace(
    /role\?: string;\s*\}/,
    `role?: string;
  initialTab?: 'profile' | 'history';
  initialCategory?: string;
  historyOnly?: boolean;
}`
  );

  // Update component definition
  code = code.replace(
    /export const AirmanProfileModal: React\.FC<AirmanProfileModalProps> = \(\{ airman, onClose, onEditAirman, role \}\) => \{/,
    `export const AirmanProfileModal: React.FC<AirmanProfileModalProps> = ({ airman, onClose, onEditAirman, role, initialTab = 'profile', initialCategory = 'ALL', historyOnly = false }) => {`
  );

  // Update state initialization
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState\<'history' \| 'profile'\>\('profile'\);/,
    `const [activeTab, setActiveTab] = useState<'history' | 'profile'>(historyOnly ? 'history' : initialTab);`
  );

  code = code.replace(
    /const \[categoryFilter, setCategoryFilter\] = useState<string>\('ALL'\);/,
    `const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);`
  );

  // Update tab buttons
  code = code.replace(
    /\{\/\* Tab switch \*\/\}\s*<div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800\/40 px-5 pt-3 shrink-0">\s*<button[\s\S]*?<\/button>\s*<\/div>/,
    `{!historyOnly && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={\`pb-2.5 px-4 text-xs font-extrabold border-b-2 transition-all \${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }\`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={\`pb-2.5 px-4 text-xs font-extrabold border-b-2 transition-all \${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }\`}
          >
            History
          </button>
        </div>
      )}`
  );

  fs.writeFileSync(file, code);
}
fixTabs();
console.log('Fixed Tabs');
