const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// Update getEffectiveManpower logic
const oldGetEff = `    airmen.forEach(a => {
      let disp = disposals[a.id];
      if (disp === undefined) {
        const myAssignments = assignments.filter(assign => assign.airmanId === a.id);
        if (myAssignments.some(assign => ['BAKE_N_BITE', 'CANTEEN'].includes(assign.dutyCode))) {
          disp = 'Deployment';
        } else if (myAssignments.some(assign => assign.dutyCode === 'TDY')) {
          if (a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
            if (gcsTdyCount < 1) {
              disp = 'TDY';
              gcsTdyCount++;
            } else {
              disp = '-';
            }
          } else {
            disp = '-';
          }
        } else {
          disp = '-';
        }
      }`;

const newGetEff = `    airmen.forEach(a => {
      let disp = disposals[a.id];
      // For migration of existing bad data
      if (disp === 'Deployment') {
         disp = undefined; // Force recalculation if it's the generic word
      }
      
      if (disp === undefined) {
        const myAssignments = assignments.filter(assign => assign.airmanId === a.id);
        const bake = myAssignments.find(assign => assign.dutyCode === 'BAKE_N_BITE');
        const canteen = myAssignments.find(assign => assign.dutyCode === 'CANTEEN');
        
        if (bake) {
          disp = 'Deployment (Bake & Bite)';
        } else if (canteen) {
          disp = 'Deployment (Canteen)';
        } else if (myAssignments.some(assign => assign.dutyCode === 'TDY')) {
          if (a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
            if (gcsTdyCount < 1) {
              disp = 'TDY';
              gcsTdyCount++;
            } else {
              disp = '-';
            }
          } else {
            disp = '-';
          }
        } else if (a.rank === 'Sgt' && a.trade === 'Sec Asst GD') {
          disp = 'Orderly Room';
        } else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst')) {
          disp = 'UWO';
        } else {
          disp = '-';
        }
      }`;

code = code.replace(oldGetEff, newGetEff);

const oldRenderBody = `                          if (myAssignments.some(assign => ['BAKE_N_BITE', 'CANTEEN'].includes(assign.dutyCode))) {
                            defaultDisp = 'Deployment';
                          } else if (myAssignments.some(assign => assign.dutyCode === 'TDY') && a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
                             const priorGcsTdy = airmen.slice(0, idx).filter(prevA => {
                               const prevAssigns = assignments.filter(assign => assign.airmanId === prevA.id);
                               return prevAssigns.some(assign => assign.dutyCode === 'TDY') && prevA.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(prevA.rank);
                             }).length;
                             if (priorGcsTdy < 1) {
                               defaultDisp = 'TDY';
                             }
                          }

                          const currentVal = disposals[a.id] !== undefined ? disposals[a.id] : defaultDisp;

                          return (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-3 py-2">{a.serNo}</td>
                              <td className="px-3 py-2 font-semibold">{a.rank}</td>
                              <td className="px-3 py-2">{a.name}</td>
                              <td className="px-3 py-2 text-slate-500">{a.trade}</td>
                              <td className="px-3 py-2 text-slate-500">{a.flightName}</td>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  placeholder="e.g. TDY, Leave..."
                                  value={currentVal}
                                  onChange={(e) => setDisposals({ ...disposals, [a.id]: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                />
                              </td>
                            </tr>
                          );`;

const newRenderBody = `                          const bake = myAssignments.find(assign => assign.dutyCode === 'BAKE_N_BITE');
                          const canteen = myAssignments.find(assign => assign.dutyCode === 'CANTEEN');

                          if (bake) {
                            defaultDisp = 'Deployment (Bake & Bite)';
                          } else if (canteen) {
                            defaultDisp = 'Deployment (Canteen)';
                          } else if (myAssignments.some(assign => assign.dutyCode === 'TDY') && a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
                             const priorGcsTdy = airmen.slice(0, idx).filter(prevA => {
                               const prevAssigns = assignments.filter(assign => assign.airmanId === prevA.id);
                               return prevAssigns.some(assign => assign.dutyCode === 'TDY') && prevA.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(prevA.rank);
                             }).length;
                             if (priorGcsTdy < 1) {
                               defaultDisp = 'TDY';
                             }
                          } else if (a.rank === 'Sgt' && a.trade === 'Sec Asst GD') {
                            defaultDisp = 'Orderly Room';
                          } else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst')) {
                            defaultDisp = 'UWO';
                          }

                          let currentVal = disposals[a.id] !== undefined ? disposals[a.id] : defaultDisp;
                          
                          // Migration for old bad state
                          if (currentVal === 'Deployment') {
                             currentVal = defaultDisp;
                          }
                          
                          const handleDisposalSelect = (val: string) => {
                             if (val === 'Custom') {
                               const customVal = prompt("Enter Custom Disposal:", currentVal);
                               if (customVal !== null) {
                                  setDisposals({ ...disposals, [a.id]: customVal });
                               }
                             } else {
                               setDisposals({ ...disposals, [a.id]: val });
                             }
                          };

                          return (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-3 py-2">{a.serNo}</td>
                              <td className="px-3 py-2 font-semibold">{a.rank}</td>
                              <td className="px-3 py-2">{a.name}</td>
                              <td className="px-3 py-2 text-slate-500">{a.trade}</td>
                              <td className="px-3 py-2 text-slate-500">{a.flightName}</td>
                              <td className="px-2 py-1">
                                <select
                                  value={['Orderly Room', 'UWO', 'TDY', 'Deployment (Bake & Bite)', 'Deployment (Canteen)', '-'].includes(currentVal) ? currentVal : (currentVal && currentVal !== '-' ? 'Custom' : '-')}
                                  onChange={(e) => handleDisposalSelect(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                >
                                  <option value="-">-</option>
                                  <option value="Orderly Room">Orderly Room</option>
                                  <option value="UWO">UWO</option>
                                  <option value="TDY">TDY</option>
                                  <option value="Deployment (Bake & Bite)">Deployment (Bake & Bite)</option>
                                  <option value="Deployment (Canteen)">Deployment (Canteen)</option>
                                  {!['Orderly Room', 'UWO', 'TDY', 'Deployment (Bake & Bite)', 'Deployment (Canteen)', '-'].includes(currentVal) && currentVal && (
                                     <option value={currentVal}>{currentVal}</option>
                                  )}
                                  <option value="Custom">Custom...</option>
                                </select>
                              </td>
                            </tr>
                          );`;

code = code.replace(oldRenderBody, newRenderBody);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
