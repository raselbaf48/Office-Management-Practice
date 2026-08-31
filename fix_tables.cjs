const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioSettingsModal.tsx', 'utf-8');

// 1. Fix TOTAL DUTY table
const totalDutyTableRegex = /<table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full md:w-64 shadow-sm">[\s\S]*?<\/table>/;
const newTotalDutyTable = `
              <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full shadow-sm">
                <thead>
                  <tr>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Duty Name</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Total</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">As Per Ratio</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Daily Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Sy Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.syDuty} onChange={v => setTotalDuty({...totalDuty, syDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.syDuty} onChange={v => setDutyRatios({...dutyRatios, syDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.syDuty} onChange={v => setDailyAllotments({...dailyAllotments, syDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">BTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.btfDuty} onChange={v => setTotalDuty({...totalDuty, btfDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.btfDuty} onChange={v => setDutyRatios({...dutyRatios, btfDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.btfDuty} onChange={v => setDailyAllotments({...dailyAllotments, btfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">NTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.ntfDuty} onChange={v => setTotalDuty({...totalDuty, ntfDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.ntfDuty} onChange={v => setDutyRatios({...dutyRatios, ntfDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.ntfDuty} onChange={v => setDailyAllotments({...dailyAllotments, ntfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Morning</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacMorning} onChange={v => setTotalDuty({...totalDuty, idacMorning: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.idacMorning} onChange={v => setDutyRatios({...dutyRatios, idacMorning: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.idacMorning} onChange={v => setDailyAllotments({...dailyAllotments, idacMorning: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Afternoon</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacAfternoon} onChange={v => setTotalDuty({...totalDuty, idacAfternoon: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.idacAfternoon} onChange={v => setDutyRatios({...dutyRatios, idacAfternoon: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.idacAfternoon} onChange={v => setDailyAllotments({...dailyAllotments, idacAfternoon: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Night</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacNight} onChange={v => setTotalDuty({...totalDuty, idacNight: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.idacNight} onChange={v => setDutyRatios({...dutyRatios, idacNight: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.idacNight} onChange={v => setDailyAllotments({...dailyAllotments, idacNight: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Reception</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.reception} onChange={v => setTotalDuty({...totalDuty, reception: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.reception} onChange={v => setDutyRatios({...dutyRatios, reception: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.reception} onChange={v => setDailyAllotments({...dailyAllotments, reception: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Airfield Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.airfieldDuty} onChange={v => setTotalDuty({...totalDuty, airfieldDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputStr val={dutyRatios.airfieldDuty} onChange={v => setDutyRatios({...dutyRatios, airfieldDuty: v})} /></td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={dailyAllotments.airfieldDuty} onChange={v => setDailyAllotments({...dailyAllotments, airfieldDuty: v})} /></td></tr>
                </tbody>
              </table>`.trim();

file = file.replace(totalDutyTableRegex, newTotalDutyTable);

// 2. Fix DISTRIBUTION AS PER MANPOWER table
// We want to move the formula row into thead so that rowSpan=3 is valid.
const theadEnd = '                </tr>\n              </thead>\n              <tbody>\n                <tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">';
const theadNew = `                </tr>
                <tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">`;

file = file.replace(theadEnd, theadNew);

const tbodyEnd = '                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Airfield Duty ÷ Total Sgt & Below</td>\n                </tr>\n                <tr className="font-mono text-sm text-slate-800 dark:text-slate-200">';
const tbodyNew = `                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Airfield Duty ÷ Total Sgt & Below</td>
                </tr>
              </thead>
              <tbody>
                <tr className="font-mono text-sm text-slate-800 dark:text-slate-200">`;

file = file.replace(tbodyEnd, tbodyNew);

fs.writeFileSync('src/components/DutyRatioSettingsModal.tsx', file, 'utf-8');
console.log('Tables updated successfully!');
