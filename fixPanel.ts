import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// I will just extract the content starting from `<div className="flex items-center justify-between px-6 py-4`
const startString = '<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 shrink-0">';
const startIndex = code.indexOf(startString);

if (startIndex !== -1) {
  // First, find the return statement
  const returnIndex = code.indexOf('return (');
  const beforeReturn = code.slice(0, returnIndex + 8);
  
  // Create a new render body
  const newRender = `
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm w-full flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
`;

  // We want the content after the header. Let's find the header text.
  const headerContentStart = code.indexOf('<div className="p-6 overflow-y-auto space-y-8 bg-slate-50 dark:bg-slate-900/50">');
  
  // We need to keep everything from `headerContentStart` to the end, but just close it correctly.
  let content = code.slice(headerContentStart);
  
  // Remove the `</div></div></div>` at the bottom and replace with `</div></div>);};`
  content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/g, '</div></div>);\n};');
  // It might be messed up because of multiple replacements.
  // Let's just find the last `</tbody></table></div></div>`
  
  const endOfTableIndex = content.lastIndexOf('</table>');
  if (endOfTableIndex !== -1) {
    const afterTable = content.indexOf('</div>', endOfTableIndex) + 6;
    const afterTable2 = content.indexOf('</div>', afterTable) + 6;
    content = content.slice(0, afterTable2) + '\n    </div>\n  );\n};\n';
  }

  code = beforeReturn + newRender + `
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Duty Ratio Config
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
` + content.substring(content.indexOf('>{/* DUTY TARGETS INPUTS */}') - 22); // roughly from `<div className="space-y-6">`
  fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
  console.log("Fixed Panel");
} else {
  console.log("Start string not found");
}
