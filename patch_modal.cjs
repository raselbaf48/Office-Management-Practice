const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const shiftAssigned = getAssignedAirmenForDuty\('IDAC', s\);[\s\S]*?(?=const isShiftSelected = activeIdaShift === s;)/;

const match = content.match(regex);

if (match) {
  const replacement = `const shiftAssigned = getAssignedAirmenForDuty('IDAC', s);
                    const allFlights: import('../types').FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
                    const unfulfilledFlights: import('../types').FlightName[] = [];
                    allFlights.forEach(flt => {
                      const fltQuota = getFlightDutyQuotaForDate(fromDate, flt, 'IDAC', s);
                      if (fltQuota > 0) {
                        const fltAssigned = shiftAssigned.filter(item => item.airman.flightName === flt).length;
                        const remaining = fltQuota - fltAssigned;
                        for (let i = 0; i < remaining; i++) {
                           unfulfilledFlights.push(flt);
                        }
                      }
                    });
                    `;
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched quota logic.");
}
