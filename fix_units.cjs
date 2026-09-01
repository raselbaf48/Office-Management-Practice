const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const FLYING_WING_UNITS = ['11 Sqn BAF', '21 Sqn BAF', '25 Sqn BAF', '31 Sqn BAF', '35 Sqn BAF', 'ATU', '155 UASU BAF'];",
  "const FLYING_WING_UNITS = ['Flg WG HQ', '1 SQN BAF', '3 SQN BAF', '5 SQN BAF', '21 SQN BAF', '105 AJTU BAF', '155 UASU BAF', '301 SAM UNIT'];"
);

fs.writeFileSync(path, code);
