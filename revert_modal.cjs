const fs = require('fs');

let file = fs.readFileSync('src/components/DutyRatioSettingsModal.tsx', 'utf-8');

// We need to remove dutyRatios and dailyAllotments state and the As Per Ratio and Daily Total columns from the Total Duty table.

// 1. Remove new Defaults
const newDefaults = `
const DEFAULT_DUTY_RATIOS = {
  syDuty: '', btfDuty: '', ntfDuty: '', idacMorning: '', idacAfternoon: '', idacNight: '', reception: '', airfieldDuty: ''
};
const DEFAULT_DAILY_ALLOTMENTS = {
  syDuty: 0, btfDuty: 0, ntfDuty: 0, idacMorning: 0, idacAfternoon: 0, idacNight: 0, reception: 0, airfieldDuty: 0
};
`;
file = file.replace(newDefaults, '');

// 2. Remove state hooks
const hooks = `  const [dutyRatios, setDutyRatios] = useState(DEFAULT_DUTY_RATIOS);
  const [dailyAllotments, setDailyAllotments] = useState(DEFAULT_DAILY_ALLOTMENTS);`;
file = file.replace(hooks, '');

// 3. Remove localStorage loads
const loads = `
    const savedRatios = localStorage.getItem('baf_duty_distribution_ratios');
    const savedDaily = localStorage.getItem('baf_duty_distribution_daily');
    if (savedRatios) setDutyRatios(JSON.parse(savedRatios));
    if (savedDaily) setDailyAllotments(JSON.parse(savedDaily));
`;
file = file.replace(loads, '');

// 4. Remove localStorage saves
const saves = `
    localStorage.setItem('baf_duty_distribution_ratios', JSON.stringify(dutyRatios));
    localStorage.setItem('baf_duty_distribution_daily', JSON.stringify(dailyAllotments));
`;
file = file.replace(saves, '');

// 5. Remove InputStr component
const inputStrComponent = `
  const InputStr = ({ val, onChange }: { val: string; onChange: (val: string) => void }) => (
    <input 
      type="text" 
      value={val} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-center bg-transparent outline-none font-bold text-slate-800 dark:text-slate-200"
      placeholder="-"
    />
  );
`;
file = file.replace(inputStrComponent, '');

// 6. Fix TOTAL DUTY table
const totalDutyTableRegex = /<table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full shadow-sm">[\s\S]*?<\/table>/;
const oldTotalDutyTable = `
              <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full md:w-64 shadow-sm">
                <thead>
                  <tr>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Duty Name</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Sy Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.syDuty} onChange={v => setTotalDuty({...totalDuty, syDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">BTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.btfDuty} onChange={v => setTotalDuty({...totalDuty, btfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">NTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.ntfDuty} onChange={v => setTotalDuty({...totalDuty, ntfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Morning</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacMorning} onChange={v => setTotalDuty({...totalDuty, idacMorning: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Afternoon</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacAfternoon} onChange={v => setTotalDuty({...totalDuty, idacAfternoon: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Night</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacNight} onChange={v => setTotalDuty({...totalDuty, idacNight: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Reception</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.reception} onChange={v => setTotalDuty({...totalDuty, reception: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Airfield Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.airfieldDuty} onChange={v => setTotalDuty({...totalDuty, airfieldDuty: v})} /></td></tr>
                </tbody>
              </table>`.trim();

file = file.replace(totalDutyTableRegex, oldTotalDutyTable);

fs.writeFileSync('src/components/DutyRatioSettingsModal.tsx', file, 'utf-8');
console.log('Reverted successfully!');
