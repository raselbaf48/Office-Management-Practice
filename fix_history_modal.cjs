const fs = require('fs');

let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');
if (!code.includes('getCurrentUserSession')) {
  code = code.replace(/import \{ ActivityHistoryItem, Airman, DutyCategoryCode, IDAShift \} from '\.\.\/types';/, 
    "import { ActivityHistoryItem, Airman, DutyCategoryCode, IDAShift } from '../types';\nimport { getCurrentUserSession } from '../utils/authSession';");
    
  code = code.replace(/const \[visibleCount, setVisibleCount\] = useState<number>\(10\);/,
    "const [visibleCount, setVisibleCount] = useState<number>(10);\n\n  const session = getCurrentUserSession();\n  const isAdmin = session?.assignedRole === 'ADMIN';\n  const adminFlight = session?.flightName;\n  const todayStr = new Date().toISOString().split('T')[0];");
    
  // Disable buttons if not authorized
  code = code.replace(/const handleUndo = async \(item: ActivityHistoryItem\) => \{/g,
    `const handleUndo = async (item: ActivityHistoryItem) => {
    if (isAdmin && adminFlight && item.airmanId) {
      const target = airmen.find(a => a.id === item.airmanId);
      if (target && target.flightName !== adminFlight) {
        alert("You cannot undo entries for personnel outside your flight.");
        return;
      }
    }
    if (isAdmin && item.fromDate < todayStr) {
      alert("You cannot undo entries for past dates.");
      return;
    }`);
    
  code = code.replace(/const startEditing = \(item: ActivityHistoryItem\) => \{/g,
    `const startEditing = (item: ActivityHistoryItem) => {
    if (isAdmin && adminFlight && item.airmanId) {
      const target = airmen.find(a => a.id === item.airmanId);
      if (target && target.flightName !== adminFlight) {
        alert("You cannot edit entries for personnel outside your flight.");
        return;
      }
    }
    if (isAdmin && item.fromDate < todayStr) {
      alert("You cannot edit entries for past dates.");
      return;
    }`);

  fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
}
