const fs = require('fs');

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Remove "Code: GD..."
const codeRegex = /<span className="text-\[11px\] opacity-85 px-2 py-0\.5 rounded-md bg-black\/20 font-bold">\s*Code: \{table\.dutyCode\}\s*<\/span>/g;
code = code.replace(codeRegex, '');

// 2. Revert header to "Month Total" using `table.totalRequiredMonth`
const oldHeader = /<div className="flex flex-col sm:flex-row items-end sm:items-center gap-1\.5 sm:space-x-3">[\s\S]*?<\/div>\s*<\/div>/g;

const newHeader = `<div className="flex items-center space-x-3">
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                      Month Total: <strong className="font-mono">{table.totalRequiredMonth || 0}</strong>
                    </span>
                  </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
