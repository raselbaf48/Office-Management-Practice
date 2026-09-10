const fs = require('fs');
let content = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

// 1. Change activeIdaShift initial state
content = content.replace(
  "const [activeIdaShift, setActiveIdaShift] = useState<IDAShift>('Morning');",
  "const [activeIdaShift, setActiveIdaShift] = useState<IDAShift | undefined>(undefined);"
);

// 2. Remove the auto-select useEffect
content = content.replace(
  /\/\/ Ensure activeIdaShift is in availableIdaShifts[\s\S]*?\}, \[availableIdaShifts, activeIdaShift\]\);/,
  "// Auto-select removed as requested by user."
);

// 3. Add protection in handleToggleAssignAirman
content = content.replace(
  "const handleToggleAssignAirman = async (airman: Airman) => {\n    const isCurrentlyAssignedToThisDuty = isAirmanAssignedToActiveDuty(airman.id);",
  `const handleToggleAssignAirman = async (airman: Airman) => {
    if ((activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && !activeIdaShift) {
      alert("Please select a shift first.");
      return;
    }
    const isCurrentlyAssignedToThisDuty = isAirmanAssignedToActiveDuty(airman.id);`
);

fs.writeFileSync('src/components/AssignDutyModal.tsx', content, 'utf8');
console.log("Done");
