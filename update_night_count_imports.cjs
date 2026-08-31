const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

if (!file.includes("import { PrintableFlyingWingModal }")) {
  file = file.replace(
    /import \{ PrintableNightCountModal \} from '\.\/PrintableNightCountModal';/,
    "import { PrintableNightCountModal } from './PrintableNightCountModal';\nimport { PrintableFlyingWingModal } from './PrintableFlyingWingModal';"
  );
}

// Add state for Flg Wg Print and Prep
if (!file.includes("isFlgWgPrintOpen")) {
  file = file.replace(
    /const \[showFlyingWingAdd, setShowFlyingWingAdd\] = useState\(false\);/,
    "const [showFlyingWingAdd, setShowFlyingWingAdd] = useState(false);\n  const [isFlgWgPrintOpen, setIsFlgWgPrintOpen] = useState(false);\n  const [showFlyingWingPrep, setShowFlyingWingPrep] = useState(false);"
  );
}

fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');
