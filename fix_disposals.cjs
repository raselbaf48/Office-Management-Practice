const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// I will just use the computed default directly in the render, but strictly limit to max 1 for GCS TDY visually as well.
const renderStart = "airmen.map((a) => {";
const renderReplacement = `airmen.map((a, idx) => {
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
code = code.replace("airmen.map((a) => {\n                          let defaultDisp = '';\n                          if (a.remarks?.toLowerCase().includes('bake') || a.remarks?.toLowerCase().includes('canteen')) {\n                            defaultDisp = 'Deployment';\n                          } else if (a.remarks?.toLowerCase().includes('tdy') && a.flightName === 'GCS' && ['Cpl', 'LAC', 'AC-1', 'AC-2'].includes(a.rank)) {\n                             // This is just visual fallback if not in state, the actual counting handles the 1 max limit.\n                             defaultDisp = 'TDY';\n                          }", renderReplacement);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
