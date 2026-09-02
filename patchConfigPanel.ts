import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// Update name and props
code = code.replace(
  "export const DutyRatioSettingsModal: React.FC<DutyRatioSettingsModalProps> = ({ onClose }) => {",
  "export const DutyRatioConfigPanel: React.FC = () => {"
);
code = code.replace(
  "interface DutyRatioSettingsModalProps {\n  onClose: () => void;\n}",
  ""
);

// Remove modal wrapper
code = code.replace(
  '<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">\n      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">',
  '<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm w-full flex flex-col border border-slate-200 dark:border-slate-800">'
);
code = code.replace(
  '<div className="flex flex-col flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-slate-900">',
  '<div className="flex flex-col p-6 space-y-8">'
);

// Remove the trailing two divs
const matchTrailingDivs = '      </div>\n    </div>\n  );\n};';
code = code.replace(matchTrailingDivs, '  </div>\n  );\n};');

// Remove close button
code = code.replace(
  /<button\s+onClick=\{onClose\}[\s\S]*?<\/button>/,
  ""
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
