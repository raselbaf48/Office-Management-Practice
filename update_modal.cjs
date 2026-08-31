const fs = require('fs');

let file = fs.readFileSync('src/components/DutyRatioSettingsModal.tsx', 'utf-8');

// We need to add state for As Per Ratio and Daily Allotment.
// First, check if they exist.
if (!file.includes('dutyRatios')) {
  // Add new state defaults
  const newDefaults = `
const DEFAULT_DUTY_RATIOS = {
  syDuty: '', btfDuty: '', ntfDuty: '', idacMorning: '', idacAfternoon: '', idacNight: '', reception: '', airfieldDuty: ''
};
const DEFAULT_DAILY_ALLOTMENTS = {
  syDuty: 0, btfDuty: 0, ntfDuty: 0, idacMorning: 0, idacAfternoon: 0, idacNight: 0, reception: 0, airfieldDuty: 0
};
`;
  file = file.replace('const DEFAULT_MANPOWER = {', newDefaults + '\nconst DEFAULT_MANPOWER = {');
  
  // Add state hooks
  const hooks = `  const [dutyRatios, setDutyRatios] = useState(DEFAULT_DUTY_RATIOS);
  const [dailyAllotments, setDailyAllotments] = useState(DEFAULT_DAILY_ALLOTMENTS);`;
  file = file.replace('  const [manpower, setManpower] = useState(DEFAULT_MANPOWER);', '  const [manpower, setManpower] = useState(DEFAULT_MANPOWER);\n' + hooks);

  // Add to localStorage loads
  const loads = `
    const savedRatios = localStorage.getItem('baf_duty_distribution_ratios');
    const savedDaily = localStorage.getItem('baf_duty_distribution_daily');
    if (savedRatios) setDutyRatios(JSON.parse(savedRatios));
    if (savedDaily) setDailyAllotments(JSON.parse(savedDaily));
`;
  file = file.replace('    if (savedManpower) setManpower(JSON.parse(savedManpower));', '    if (savedManpower) setManpower(JSON.parse(savedManpower));' + loads);

  // Add to localStorage saves
  const saves = `
    localStorage.setItem('baf_duty_distribution_ratios', JSON.stringify(dutyRatios));
    localStorage.setItem('baf_duty_distribution_daily', JSON.stringify(dailyAllotments));
`;
  file = file.replace("    localStorage.setItem('baf_duty_distribution_manpower', JSON.stringify(manpower));", "    localStorage.setItem('baf_duty_distribution_manpower', JSON.stringify(manpower));" + saves);
  
  // Add InputStr component
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
  file = file.replace('  const InputTD = ({ val, onChange }: { val: number; onChange: (val: number) => void }) => (', inputStrComponent + '\n  const InputTD = ({ val, onChange }: { val: number; onChange: (val: number) => void }) => (');
}

fs.writeFileSync('src/components/DutyRatioSettingsModal.tsx', file, 'utf-8');
console.log('States added');
