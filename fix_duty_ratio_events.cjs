const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

content = content.replace(
  /localStorage\.setItem\('baf_duty_distribution_custom_flt', JSON\.stringify\(customFltDist\)\);/g,
  `localStorage.setItem('baf_duty_distribution_custom_flt', JSON.stringify(customFltDist));
    window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated'));`
);

content = content.replace(
  /localStorage\.setItem\('baf_duty_distribution_disposals_' \+ \(targetDate \|\| 'default'\), JSON\.stringify\(disposals\)\);/g,
  `localStorage.setItem('baf_duty_distribution_disposals_' + (targetDate || 'default'), JSON.stringify(disposals));
    window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated'));`
);

content = content.replace(
  /localStorage\.setItem\('baf_duty_distribution_manpower', JSON\.stringify\(currentManpower\)\);/g,
  `localStorage.setItem('baf_duty_distribution_manpower', JSON.stringify(currentManpower));
    window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated'));`
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', content, 'utf8');
