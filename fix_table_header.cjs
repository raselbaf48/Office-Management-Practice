const fs = require('fs');

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const oldHeader = `<div className="flex items-center space-x-3">
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                      Month Total: <strong className="font-mono">{tableTotal}</strong>
                    </span>
                  </div>`;

const newHeader = `<div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:space-x-3">
                    <div className="flex space-x-1.5">
                      <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-md">
                        Daily Req: {table.totalRequiredDaily || 0}
                      </span>
                      <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-md">
                        Monthly Req: {table.totalRequiredMonth || 0}
                      </span>
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                      Allocated: <strong className="font-mono">{tableTotal}</strong>
                    </span>
                  </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
