const fs = require('fs');
let code = fs.readFileSync('src/components/IdacDutyAssignModal.tsx', 'utf8');

code = code.replace(
  "                ))}              </div>",
  "                )) : null}              </div>"
);

fs.writeFileSync('src/components/IdacDutyAssignModal.tsx', code);
