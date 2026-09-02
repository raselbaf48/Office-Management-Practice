import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

code = code.replace(
  /import \{ DutyRatioConfigPanel \} from '\.\/DutyRatioConfigPanel';/,
  "import { FlightDutyRatioModal } from './FlightDutyRatioModal';"
);

code = code.replace(
  /<DutyRatioConfigPanel \/>/,
  `<FlightDutyRatioModal
              date={new Date().toISOString().split('T')[0]}
              onClose={() => {}}
              onRatiosUpdated={() => setMatrix(getStoredDutyMatrix())}
            />`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
