const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(/\| 'BAKE_N_BITE'/, "| 'BAKE_N_BITE'\n  | 'CANTEEN'");
fs.writeFileSync('src/types.ts', code, 'utf-8');
console.log('Fixed DutyCategoryCode');
