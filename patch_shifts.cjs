const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  // Dynamically compute available IDAC shifts based on ratio matrix for fromDate and activeFlight
  const availableIdaShifts = useMemo(() => {
    return getIdacShiftsForDateAndFlight(fromDate, activeFlight !== 'All' ? activeFlight : undefined);
  }, [fromDate, activeFlight]);`;

const replaceCode = `  // Dynamically compute available IDAC shifts based on ratio matrix for fromDate
  // DO NOT filter by activeFlight, otherwise users can't switch to a shift assigned to a different flight!
  const availableIdaShifts = useMemo(() => {
    return getIdacShiftsForDateAndFlight(fromDate, undefined);
  }, [fromDate]);`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched availableIdaShifts!");
