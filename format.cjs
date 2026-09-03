const fs = require('fs');

let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// I'll strip out all the '{(!activeTab || activeTab === ...' that I added.
code = code.replace(/\{\(!activeTab \|\| activeTab === 'TOTAL_DUTY'\) && \(\n        <>\n/g, '');
code = code.replace(/<\/>\n      \)\}\n/g, '');
code = code.replace(/\{\(!activeTab \|\| activeTab === 'MANPOWER'\) && \(\n        <>\n/g, '');
code = code.replace(/\{\(!activeTab \|\| activeTab === 'DUTY_DISTRIBUTION'\) && \(\n        <>\n/g, '');
code = code.replace(/      <\/>\n      \)\}\n    <\/div>\n  \);\n\};/g, '    </div>\n  );\n};');

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
