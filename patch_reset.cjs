const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  // Reset manual flight selection tracking when duty config changes
  useEffect(() => {
    userManuallySelectedFlightRef.current = false;
  }, [activeDutyCode, fromDate]);`;

const replaceCode = `  // Reset manual flight selection tracking when duty config changes
  useEffect(() => {
    userManuallySelectedFlightRef.current = false;
    if (activeDutyCode !== 'IDAC' && activeDutyCode !== 'IDA') {
        setActiveIdaShift(undefined);
    } else {
        // When switching to IDAC, also reset shift to ensure no shift/flight is selected initially
        setActiveIdaShift(undefined);
    }
  }, [activeDutyCode, fromDate]);`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Reset!");
