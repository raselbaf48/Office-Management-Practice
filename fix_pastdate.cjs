const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

code = code.replace("const isPastDate = fromDate < new Date().toISOString().split('T')[0];", 
  "const isPastDate = (selectedDate || new Date().toISOString().split('T')[0]) < new Date().toISOString().split('T')[0];");

fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
