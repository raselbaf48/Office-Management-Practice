const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Multi-Select Airmen List \*\/\}\s*\{\(\(\) => \{\s*const flightAirmen = airmen\.filter\(\(a\) => a\.flightName === disposalFlight\);/;

const replacementStr = `{/* Multi-Select Airmen List */}
              {(() => {
                const flightAirmen = airmen.filter((a) => {
                  if (a.dateJoined && a.dateJoined > fromDate) return false;
                  if (a.dateLeft && a.dateLeft < fromDate) return false;
                  return a.flightName === disposalFlight;
                });`;

if (regex.test(content)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Patched Multi-Select in PrintableParadeStateModal.");
} else {
  console.log("Could not find regex match for Multi-Select.");
}
