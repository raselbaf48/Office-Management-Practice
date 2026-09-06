const fs = require('fs');
let code = fs.readFileSync('src/services/apiBridge.ts', 'utf8');

const anchor = "if (pathname === '/api/import/load-official-roster') {";
const restore = `    if (pathname === '/api/import/analyze-duty-doc') {
      const result = localDb.analyzeDutyDocument(body);
      return jsonResponse(result);
    }
    `;

if (code.includes(anchor)) {
    code = code.replace(anchor, restore + anchor);
    fs.writeFileSync('src/services/apiBridge.ts', code);
    console.log("Restored analyze-duty-doc in apiBridge");
} else {
    console.log("Could not find anchor in apiBridge");
}
