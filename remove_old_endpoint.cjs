const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const startIndex = serverCode.indexOf('// --- MULTI-PAGE AI DUTY IMPORT ENDPOINT (Supports 20+ Unlimited Pages) ---');
const endIndex = serverCode.indexOf('// 8.1. Direct Load Official 155 UASU', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  serverCode = serverCode.substring(0, startIndex) + serverCode.substring(endIndex);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Successfully removed old endpoint");
} else {
  console.log("Could not find old endpoint bounds", startIndex, endIndex);
}
