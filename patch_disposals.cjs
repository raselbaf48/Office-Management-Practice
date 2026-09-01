const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// The bottom list has: COL A, COL B, COL C
// In the picture:
// Col 1: On Parade (already handled in left side)
// Col 2: Bake & Bite, Det/Tdy, Canteen
// Col 3: Duty On
// Col 4: Duty Off, ESSN, CMH, Sick Report, Drill Cat C, Guard of Honour, K/O & Reception (Wait, where are the rest?)

// Wait, the picture has:
// Col 1: On Parade
// Col 2: Bake & Bite, Det/ Tdy, Canteen
// Col 3: Duty On
// Col 4: Duty Off

// Let's just group them logically. 
// Col A (Bake & Bite, Det/Tdy, Canteen, Leave, ESSN)
// Col B (CMH, Sick Report, Drill Cat-C, K/O & Reception, Guard of Honour)
// Col C (Duty On, Duty Off, OTHERS)

const newCols = `
                {/* DISPOSALS (ONLY SHOWN IF NOT EMPTY / >0 AIRMEN, NO EMPTY HEADINGS) */}
                <div className="flex-1 flex flex-wrap gap-5">
                  {/* DISPOSAL COL A */}
                  {(bakeBiteList.length > 0 || tdyList.length > 0 || canteenList.length > 0 || leaveList.length > 0 || essnList.length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {bakeBiteList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Bake & Bite</h3>
                          {renderDisposalAirmenList(bakeBiteList, 'BAKE_N_BITE', 'Bake & Bite')}
                        </div>
                      )}
                      {tdyList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Det/ Tdy</h3>
                          {renderDisposalAirmenList(tdyList, 'TDY', 'Det/Tdy')}
                        </div>
                      )}
                      {canteenList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Canteen</h3>
                          {renderDisposalAirmenList(canteenList, 'CANTEEN', 'Canteen')}
                        </div>
                      )}
                      {leaveList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Leave</h3>
                          {renderDisposalAirmenList(leaveList, 'LEAVE', 'Leave')}
                        </div>
                      )}
                      {essnList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">
                            ESSN
                          </h3>
                          {renderDisposalAirmenList(essnList, 'ESSN', 'ESSN')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPOSAL COL B */}
                  {(cmhList.length > 0 || sickReportList.length > 0 || drillCatCList.length > 0 || receptionList.length > 0 || gamesList.length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {cmhList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">
                            CMH/BNS/BSH
                          </h3>
                          {renderDisposalAirmenList(cmhList, 'CMH', 'CMH')}
                        </div>
                      )}
                      {sickReportList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Sick Report</h3>
                          {renderDisposalAirmenList(sickReportList, 'SICK_REPORT', 'Sick Report')}
                        </div>
                      )}
                      {drillCatCList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Drill Cat-C</h3>
                          {renderDisposalAirmenList(drillCatCList, 'ADMIN_ORDER', 'Drill Cat-C')}
                        </div>
                      )}
                      {receptionList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">K/O & Reception</h3>
                          {renderDisposalAirmenList(receptionList, 'RECEPTION', 'K/O & Reception')}
                        </div>
                      )}
                      {gamesList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Guard of Honour</h3>
                          {renderDisposalAirmenList(gamesList, 'GAMES', 'Guard of Honour')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPOSAL COL C */}
                  {(dutyOnList.length > 0 || (!isPtDocument && dutyOffList.length > 0) || Object.keys(customDisposalsMap).length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {dutyOnList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Duty On</h3>
                          {renderDisposalAirmenList(dutyOnList, 'DUTY_ON', 'Duty On')}
                        </div>
                      )}
                      {!isPtDocument && dutyOffList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Duty Off</h3>
                          {renderDisposalAirmenList(dutyOffList, 'DUTY_OFF', 'Duty Off')}
                        </div>
                      )}

                      {/* Dynamic Custom Disposals / Others */}
                      {Object.entries(customDisposalsMap).map(([catName, airmenList]) => {
                        if (!airmenList || airmenList.length === 0) return null;
                        return (
                          <div key={catName}>
                            <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">
                              {catName}
                            </h3>
                            {renderDisposalAirmenList(airmenList, 'OTHERS', catName)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
`;

// we need to replace from `<div className="flex-1 flex flex-wrap gap-5">` to `</div>` before `</div>\n            </div>\n            {/* SPACER ROW`
const startRegex = /\{\/\* DISPOSALS \(ONLY SHOWN IF NOT EMPTY \/ >0 AIRMEN, NO EMPTY HEADINGS\) \*\/\}/;
const endIndex = code.indexOf('{/* SPACER ROW: 0.9 INCH HEIGHT');
if (code.match(startRegex) && endIndex !== -1) {
  const startIndex = code.match(startRegex).index;
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  code = before + newCols + '              </div>\n            </div>\n            ' + after;
  
  // Wait, I need to make sure drillCatCList is defined in the arrays.
  const arraysStart = code.indexOf('const leaveList: { airman: Airman; note?: string }[] = [];');
  if (arraysStart !== -1 && !code.includes('const drillCatCList:')) {
    code = code.replace(
      'const leaveList: { airman: Airman; note?: string }[] = [];',
      'const leaveList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];'
    );
    
    // Also push into it:
    code = code.replace(
      '} else if ([\'ADMIN_ORDER\', \'CAT_C\', \'DRILL\'].includes(codeUpper) || notesLower.includes(\'drill\')) {\n          drillCatCCount++;\n        }',
      '} else if ([\'ADMIN_ORDER\', \'CAT_C\', \'DRILL\'].includes(codeUpper) || notesLower.includes(\'drill\')) {\n          drillCatCCount++;\n        }' // this is handled in getFlightStats, but what about targetAirmen?
    );
  }
}

// In the targetAirmen loop, where does it push?
// "targetAirmen.forEach((airman) => {"
code = code.replace(
  'const onPtList: { airman: Airman; note?: string }[] = [];',
  'const onPtList: { airman: Airman; note?: string }[] = [];\n  const drillCatCList: { airman: Airman; note?: string }[] = [];'
);

code = code.replace(
  '} else if ([', // let's find the drill push
  '} else if (['
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
