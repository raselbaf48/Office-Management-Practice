const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

const targetState = `  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);`;
const newState = `  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);
  
  // New Duty Modal State
  const [isAddingNewDuty, setIsAddingNewDuty] = useState(false);
  const [newDutyName, setNewDutyName] = useState('');
  const [newDutyFlights, setNewDutyFlights] = useState<FlightName[]>(['Mechanics', 'Avionics', 'GCS', 'Admin']);
  const [newDutyRanks, setNewDutyRanks] = useState<Rank[]>(['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']);
`;

if (code.includes(targetState) && !code.includes('isAddingNewDuty')) {
    code = code.replace(targetState, newState);
    fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
    console.log("State added");
} else {
    console.log("State already added or target not found");
}
