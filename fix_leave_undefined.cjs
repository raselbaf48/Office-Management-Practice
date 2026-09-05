const fs = require('fs');
let code = fs.readFileSync('src/components/LeaveRegisterView.tsx', 'utf8');

const cards = ['Casual', 'Annual', 'Recreation', 'Total'];
let i = 0;

code = code.replace(
  /onClick=\{\(\) => setSummaryFilter\(summaryFilter === 'Casual' \? null : 'Casual'\)\}/g,
  () => {
    if (i >= cards.length) return `onClick={() => setSummaryFilter(summaryFilter === 'Casual' ? null : 'Casual')}`;
    const val = cards[i++];
    return `onClick={() => setSummaryFilter(summaryFilter === '${val}' ? null : '${val}')}`;
  }
);

let j = 0;
code = code.replace(
  /\$\{summaryFilter === 'Casual' \? 'ring-2/g,
  () => {
    if (j >= cards.length) return `\${summaryFilter === 'Casual' ? 'ring-2`;
    const val = cards[j++];
    return `\${summaryFilter === '${val}' ? 'ring-2`;
  }
);

fs.writeFileSync('src/components/LeaveRegisterView.tsx', code);
