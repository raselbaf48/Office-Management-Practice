const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const calcStr = `  const getEffectiveManpower = () => {
    const counts = {
      mechSgt: 0, mechCpl: 0,
      aviSgt: 0, aviCpl: 0,
      gcsSgt: 0, gcsCpl: 0,
      adminSgt: 0, adminCpl: 0,
    };
    
    let gcsTdyCount = 0;

    airmen.forEach(a => {
      let disp = disposals[a.id];
      if (disp === undefined) {
        if (a.remarks?.toLowerCase().includes('bake') || a.remarks?.toLowerCase().includes('canteen')) {
          disp = 'Deployment';
        } else if (a.remarks?.toLowerCase().includes('tdy')) {
          if (a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
            if (gcsTdyCount < 1) {
              disp = 'TDY';
              gcsTdyCount++;
            } else {
              disp = '';
            }
          } else {
            disp = '';
          }
        } else {
          disp = '';
        }
      }

      if (!disp || disp.trim() === '') {`;

const newCalcStr = `  const getEffectiveManpower = () => {
    const counts = {
      mechSgt: 0, mechCpl: 0,
      aviSgt: 0, aviCpl: 0,
      gcsSgt: 0, gcsCpl: 0,
      adminSgt: 0, adminCpl: 0,
    };
    
    let gcsTdyCount = 0;
    const assignments = targetDate ? localDb.getAssignmentsByDate(targetDate) : [];

    airmen.forEach(a => {
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
      }

      if (!disp || disp.trim() === '' || disp.trim() === '-') {`;

code = code.replace(calcStr, newCalcStr);

const renderStr = `                        {airmen.map((a, idx) => {
                          let defaultDisp = '';
                          if (a.remarks?.toLowerCase().includes('bake') || a.remarks?.toLowerCase().includes('canteen')) {
                            defaultDisp = 'Deployment';
                          } else if (a.remarks?.toLowerCase().includes('tdy') && a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
                             // Limit to 1 visually
                             const priorGcsTdy = airmen.slice(0, idx).filter(prevA => prevA.remarks?.toLowerCase().includes('tdy') && prevA.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(prevA.rank)).length;
                             if (priorGcsTdy < 1) {
                               defaultDisp = 'TDY';
                             }
                          }`;

const newRenderStr = `                        {airmen.map((a, idx) => {
                          let defaultDisp = '-';
                          const assignments = targetDate ? localDb.getAssignmentsByDate(targetDate) : [];
                          const myAssignments = assignments.filter(assign => assign.airmanId === a.id);

                          if (myAssignments.some(assign => ['BAKE_N_BITE', 'CANTEEN'].includes(assign.dutyCode))) {
                            defaultDisp = 'Deployment';
                          } else if (myAssignments.some(assign => assign.dutyCode === 'TDY') && a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {
                             const priorGcsTdy = airmen.slice(0, idx).filter(prevA => {
                               const prevAssigns = assignments.filter(assign => assign.airmanId === prevA.id);
                               return prevAssigns.some(assign => assign.dutyCode === 'TDY') && prevA.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(prevA.rank);
                             }).length;
                             if (priorGcsTdy < 1) {
                               defaultDisp = 'TDY';
                             }
                          }`;

code = code.replace(renderStr, newRenderStr);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
