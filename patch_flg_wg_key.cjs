const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const saved = localStorage.getItem('flg_wg_saved_disposals');",
  "const saved = localStorage.getItem('flg_wg_saved_disposals_v2');"
);
code = code.replace(
  "localStorage.setItem('flg_wg_saved_disposals', JSON.stringify(updated));",
  "localStorage.setItem('flg_wg_saved_disposals_v2', JSON.stringify(updated));"
);
code = code.replace(
  "localStorage.setItem('flg_wg_saved_disposals', JSON.stringify(updated));",
  "localStorage.setItem('flg_wg_saved_disposals_v2', JSON.stringify(updated));"
);

// We need to do a global replace just to be safe
code = code.replace(/flg_wg_saved_disposals/g, 'flg_wg_saved_disposals_v2');
// but wait, we already have flg_wg_saved_disposals_v2 so doing it globally might make it v2_v2 if we ran it twice. Let's just do it globally once.

fs.writeFileSync(path, code);
