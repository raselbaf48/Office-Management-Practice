import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// I will just use regex to clean up these conditionally wrapped blocks and fix the syntax.

// Let's remove the weird )}\n      </div>
code = code.replace(/      \)}\n      <\/div>\n\n      \{\(!activeTab \|\| activeTab === 'DUTY_DISTRIBUTION'\) && \(\n        <>/g, '      </div>\n      )}\n\n      {(!activeTab || activeTab === \'DUTY_DISTRIBUTION\') && (\n        <>');

// Let's also check where the other wrapping is.
code = code.replace(/\{\(!activeTab \|\| activeTab === 'TOTAL_DUTY'\) && \(\n        \{\/\* TOTAL DUTY \*\/\}/g, '{(!activeTab || activeTab === \'TOTAL_DUTY\') && (\n        <>\n        {/* TOTAL DUTY */}');

code = code.replace(/\)\}\n        \{\/\* EFFECTIVE MANPOWER \*\/\}/g, '</>\n      )}\n        {/* EFFECTIVE MANPOWER */}');

code = code.replace(/\{\(!activeTab \|\| activeTab === 'MANPOWER'\) && \(\n        \{\/\* EFFECTIVE MANPOWER \*\/\}/g, '{(!activeTab || activeTab === \'MANPOWER\') && (\n        <>\n        {/* EFFECTIVE MANPOWER */}');

code = code.replace(/<\/div>\n      \)\}\n\n      \{\(!activeTab/g, '</>\n      )}\n\n      {(!activeTab');

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
