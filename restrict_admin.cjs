const fs = require('fs');

// 1. AssignDutyModal.tsx
let adm = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
adm = adm.replace(/\{\(\['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'\] as \(FlightName \| 'All'\)\[\]\)\.map\(\(flt\) => \(/,
`{(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((flt) => {
                if (isAdmin && adminFlight && flt !== adminFlight) return null;
                return (`);
adm = adm.replace(/<\/button>\n              \)\)\}/g, "</button>\n                );\n              })}");
fs.writeFileSync('src/components/AssignDutyModal.tsx', adm);
