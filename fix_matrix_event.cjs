const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_target_date', targetDate);
  }, [targetDate]);`;

const newEffect = `  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_target_date', targetDate);
  }, [targetDate]);

  useEffect(() => {
    const handleUpdate = () => setMatrix(getStoredDutyMatrix());
    window.addEventListener('baf_custom_duties_updated', handleUpdate);
    window.addEventListener('baf_duty_ratio_updated', handleUpdate);
    return () => {
      window.removeEventListener('baf_custom_duties_updated', handleUpdate);
      window.removeEventListener('baf_duty_ratio_updated', handleUpdate);
    };
  }, []);`;

if (code.includes(oldEffect)) {
  code = code.replace(oldEffect, newEffect);
  fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
  console.log('Added event listener to DutyRatioMatrixView');
}
