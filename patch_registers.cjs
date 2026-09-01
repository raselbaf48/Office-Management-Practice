const fs = require('fs');

function patchTdy() {
  let content = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf-8');
  
  const target = `<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Currently On TDY</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeTdyCount} Airmen</h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Outstation Active Today</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
        </div>`;

  const replacement = `{(() => {
          const currentList = tdyRecordsList.filter((r: any) => r.currentlyOnTdy);
          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0 flex justify-between">
                <span>Currently On TDY</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{currentList.length}</span>
              </div>
              {currentList.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {currentList.map((r: any) => {
                    const airman = airmen.find(a => a.id === r.airmanId);
                    return (
                      <div key={r.airmanId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
                        <span>{airman ? \`\${airman.rank} \${airman.name}\` : 'Unknown Airman'}</span>
                        <span className="text-[10px] text-slate-400">{airman ? airman.flightName : ''}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                  Nobody on TDY today
                </div>
              )}
            </div>
          );
        })()}`;

  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/TdyRegisterView.tsx', content, 'utf-8');
}

function patchAtt() {
  let content = fs.readFileSync('src/components/AttachmentRegisterView.tsx', 'utf-8');
  
  const target = `<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Currently On Attachment</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeAttCount} Airmen</h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Outstation Active Today</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
        </div>`;

  const replacement = `{(() => {
          const currentList = attRecordsList.filter((r: any) => r.currentlyOnAtt);
          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0 flex justify-between">
                <span>Currently On Attachment</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{currentList.length}</span>
              </div>
              {currentList.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {currentList.map((r: any) => {
                    const airman = airmen.find(a => a.id === r.airmanId);
                    return (
                      <div key={r.airmanId} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
                        <span>{airman ? \`\${airman.rank} \${airman.name}\` : 'Unknown Airman'}</span>
                        <span className="text-[10px] text-slate-400">{airman ? airman.flightName : ''}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
                  Nobody on Attachment today
                </div>
              )}
            </div>
          );
        })()}`;

  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/AttachmentRegisterView.tsx', content, 'utf-8');
}

patchTdy();
patchAtt();
console.log("Patched KPI cards");
