const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = '{/* 4. Duty Off */}';
const targetEnd = '{/* Operational Overview Insights */}';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find targets");
    process.exit(1);
}

const replacement = `        {/* Dynamic Disposals */}
        {(() => {
          const disposalsMap = new Map<string, { count: number, category: string, color: string, icon: any, title: string, subtitle: string }>();
          
          if (data?.personnelStatusList) {
            data.personnelStatusList.forEach((p) => {
              if (p.statusCategory === 'PARADE' || p.statusCategory === 'DUTY') return;
              
              let cat = p.statusCategory === 'OTHERS' ? p.dutyCode : p.statusCategory;
              let title = p.dutyName || p.dutyCode || 'Other Disposal';
              let subtitle = 'Disposal';
              let color = 'slate';
              let IconComp = Activity;

              if (p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF') { title = 'Duty Off'; cat = 'DUTY_OFF'; color = 'indigo'; IconComp = Moon; subtitle = 'Rest'; }
              else if (p.statusCategory === 'LEAVE') { title = 'On Leave'; cat = 'LEAVE'; color = 'purple'; IconComp = UserMinus; subtitle = 'Leave'; }
              else if (p.statusCategory === 'TDY') { title = 'TDY'; cat = 'TDY'; color = 'cyan'; IconComp = Plane; subtitle = 'TDY'; }
              else if (p.dutyCode === 'BAKE_N_BITE' || p.statusCategory === 'BAKE_N_BITE') { title = 'Bake & Bite'; cat = 'BAKE_N_BITE'; color = 'rose'; IconComp = Coffee; subtitle = 'Mess'; }
              else if (p.statusCategory === 'SICK_REPORT' || p.dutyCode === 'SICK_REPORT') { title = 'Sick Report'; cat = 'SICK_REPORT'; color = 'red'; IconComp = Plus; subtitle = 'MI Room'; }
              else if (p.statusCategory === 'CMH' || p.dutyCode === 'CMH') { title = 'BNS/CMH'; cat = 'CMH'; color = 'red'; IconComp = Plus; subtitle = 'Hospital'; }
              else if (p.statusCategory === 'ESSN' || p.dutyCode === 'ESSN') { title = 'Essential Task'; cat = 'ESSN'; color = 'orange'; IconComp = ShieldAlert; subtitle = 'Task'; }
              else if (p.statusCategory === 'ADMIN_ORDER' || p.dutyCode === 'ADMIN_ORDER') { title = 'Admin Order'; cat = 'ADMIN_ORDER'; color = 'blue'; IconComp = PenTool; subtitle = 'Admin'; }
              else if (p.statusCategory === 'CLASS_TRG' || p.dutyCode === 'CLASS_TRG') { title = 'Class / Trg'; cat = 'CLASS_TRG'; color = 'teal'; IconComp = Calendar; subtitle = 'Training'; }
              else {
                cat = p.dutyCode || 'OTHERS';
                title = p.dutyName || p.dutyCode || 'Other Disposal';
                color = 'slate';
                IconComp = Activity;
                subtitle = 'Other';
              }

              if (disposalsMap.has(cat)) {
                disposalsMap.get(cat)!.count++;
              } else {
                disposalsMap.set(cat, { count: 1, category: cat, color, icon: IconComp, title, subtitle });
              }
            });
          }

          return Array.from(disposalsMap.values()).map((disp, idx) => {
            const colors: Record<string, any> = {
              indigo: { border: 'border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-950/60 group-hover:bg-indigo-200' },
              purple: { border: 'border-purple-200/80 dark:border-purple-900/50 hover:border-purple-500', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/60 group-hover:bg-purple-200' },
              cyan: { border: 'border-cyan-200/80 dark:border-cyan-900/50 hover:border-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-950/60 group-hover:bg-cyan-200' },
              rose: { border: 'border-rose-200/80 dark:border-rose-900/50 hover:border-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-950/60 group-hover:bg-rose-200' },
              red: { border: 'border-red-200/80 dark:border-red-900/50 hover:border-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/60 group-hover:bg-red-200' },
              orange: { border: 'border-orange-200/80 dark:border-orange-900/50 hover:border-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/60 group-hover:bg-orange-200' },
              blue: { border: 'border-blue-200/80 dark:border-blue-900/50 hover:border-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/60 group-hover:bg-blue-200' },
              teal: { border: 'border-teal-200/80 dark:border-teal-900/50 hover:border-teal-500', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-950/60 group-hover:bg-teal-200' },
              slate: { border: 'border-slate-200/80 dark:border-slate-800/50 hover:border-slate-500', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/60 group-hover:bg-slate-200' },
            };
            const theme = colors[disp.color] || colors.slate;
            
            return (
              <div
                key={disp.category + idx}
                onClick={() => {
                  setModalSearchQuery('');
                  setStrengthCategoryModal({
                    title: \`\${disp.title} Personnel\`,
                    category: disp.category as any,
                    color: disp.color as any,
                  });
                }}
                className={\`bg-white dark:bg-slate-900 border \${theme.border} rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]\`}
              >
                <div className="flex items-center justify-between">
                  <span className={\`text-[11px] font-bold \${theme.text} font-bold tracking-wider uppercase line-clamp-1\`}>
                    {disp.title}
                  </span>
                  <div className={\`w-7 h-7 rounded-lg \${theme.bg} flex items-center justify-center \${theme.text} transition-colors shrink-0\`}>
                    <disp.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={\`text-2xl font-black \${theme.text}\`}>
                    {disp.count}
                  </span>
                  <span className={\`text-[10px] font-bold \${theme.text} flex items-center space-x-0.5\`}>
                    <span>{disp.subtitle}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          });
        })()}
      </div>

      `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(file, newContent, 'utf8');
console.log("Patched dynamic disposals successfully");
