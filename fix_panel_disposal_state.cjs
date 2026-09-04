const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const stateStr = `  const [showNominalRoll, setShowNominalRoll] = useState(false);
  const [disposals, setDisposals] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('baf_duty_distribution_disposals');
    return saved ? JSON.parse(saved) : {};
  });

  const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);`;

const newStateStr = `  const [showNominalRoll, setShowNominalRoll] = useState(false);
  const [disposals, setDisposals] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('baf_duty_distribution_disposals_' + (targetDate || 'default'));
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const saved = localStorage.getItem('baf_duty_distribution_disposals_' + (targetDate || 'default'));
    setDisposals(saved ? JSON.parse(saved) : {});
  }, [targetDate]);

  const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);`;

code = code.replace(stateStr, newStateStr);

const effStr = `  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_disposals', JSON.stringify(disposals));
  }, [disposals]);`;

const newEffStr = `  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_disposals_' + (targetDate || 'default'), JSON.stringify(disposals));
  }, [disposals, targetDate]);`;

code = code.replace(effStr, newEffStr);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
