const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

const replacement = `
              {isReadOnly ? (
                <div className="col-span-full py-8 text-center text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="mb-2">🚫</div>
                  Modifications are disabled for past dates.
                </div>
              ) : candidatePersonnel.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No matching candidates found for this duty & flight.
                </div>
              ) : (
                candidatePersonnel.map((airman) => {`;

code = code.replace(/\{\s*candidatePersonnel\.length === 0 \? \([\s\S]*?<div className="col-span-full py-8 text-center text-xs text-slate-400">[\s\S]*?No matching candidates found for this duty & flight\.[\s\S]*?<\/div>[\s\S]*?\) : \([\s\S]*?candidatePersonnel\.map\(\(airman\) => \{/m, replacement);

fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
