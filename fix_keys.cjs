const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/flg_wg_saved_disposals_v2_v2/g, 'flg_wg_saved_disposals_v3');
code = code.replace(/flg_wg_saved_disposals_v2/g, 'flg_wg_saved_disposals_v3');
code = code.replace(/flg_wg_saved_disposals/g, 'flg_wg_saved_disposals_v3');

fs.writeFileSync(path, code);
