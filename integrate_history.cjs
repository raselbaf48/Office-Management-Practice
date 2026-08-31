const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

if (!file.includes('import { FlgWgHistoryModal }')) {
  file = file.replace(
    /import \{ PrintableFlyingWingModal \} from '\.\/PrintableFlyingWingModal';/,
    "import { PrintableFlyingWingModal } from './PrintableFlyingWingModal';\nimport { FlgWgHistoryModal } from './FlgWgHistoryModal';"
  );
}

if (!file.includes('showFlgWgHistory')) {
  file = file.replace(
    /const \[isFlgWgPrintOpen, setIsFlgWgPrintOpen\] = useState\(false\);/,
    "const [isFlgWgPrintOpen, setIsFlgWgPrintOpen] = useState(false);\n  const [showFlgWgHistory, setShowFlgWgHistory] = useState(false);"
  );
}

// Update History button logic
const oldHistoryBtn = `if (activeTab === 'Flying Wing') {
                alert('You can navigate to previous records by selecting dates in the date picker (Dt:). Previous updates are saved there.');
              }`;
const newHistoryBtn = `if (activeTab === 'Flying Wing') {
                setShowFlgWgHistory(true);
              }`;
file = file.replace(oldHistoryBtn, newHistoryBtn);

// Add modal rendering at the bottom
const oldEnd = `{isFlgWgPrintOpen && (`;
const newEnd = `{showFlgWgHistory && (
        <FlgWgHistoryModal 
          onClose={() => setShowFlgWgHistory(false)}
          onSelectDate={(newDate) => {
            setFromDate(newDate);
            setToDate(newDate);
            setSelectedDate(newDate);
          }}
        />
      )}

      {isFlgWgPrintOpen && (`;

if (!file.includes('<FlgWgHistoryModal')) {
    file = file.replace(oldEnd, newEnd);
}

fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');
