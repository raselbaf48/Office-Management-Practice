import fs from 'fs';

const path = 'src/types.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/  trade: string;\n  mobileNo\?: string;       \/\/ e\.g\. Avionic, Aero Mech, Armt Mech, GCO, Admin/g, '  trade: string;       // e.g. Avionic, Aero Mech, Armt Mech, GCO, Admin');

fs.writeFileSync(path, code);
