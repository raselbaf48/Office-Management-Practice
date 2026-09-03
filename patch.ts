import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const brokenSection = `      {viewMode !== 'DUTY_RATIO' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <DutyRatioConfigPanel activeTab={viewMode} />
        </div>
      ) : (
        <div className="space-y-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured daily quota ratio for Security Duty, Nazirpara T/F, Base T/F, and IDAC Shifts (Days 1–31).
            </p>
          </div>
        </div>

        {/* Actions */}`;

const fixedSection = `          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Duty Ratios Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured daily quota ratio for Security Duty, Nazirpara T/F, Base T/F, and IDAC Shifts (Days 1–31).
            </p>
          </div>
        </div>

        {/* Actions */}`;

code = code.replace(brokenSection, fixedSection);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
