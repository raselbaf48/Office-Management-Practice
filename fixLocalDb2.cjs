const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// We want to skip localDB parsing for the API bridge if it hits analyze-duty-doc, wait, apiBridge uses localDB right now!
// Wait! If the frontend hits /api/import/analyze-duty-doc, and the interceptor is ACTIVE, the interceptor forwards it to localDb.analyzeDutyDocument(body)!
// So it never hits the backend server.ts!
// Let's remove analyze-duty-doc from the apiBridge interceptor again!

const interceptorCode = `if (pathname === '/api/import/analyze-duty-doc') {
      const result = localDb.analyzeDutyDocument(body);
      return jsonResponse(result);
    }`;

if (code.includes(interceptorCode)) {
    console.log("WAIT, it's in apiBridge!");
}

let apiBridgeCode = fs.readFileSync('src/services/apiBridge.ts', 'utf8');
if (apiBridgeCode.includes(interceptorCode)) {
    apiBridgeCode = apiBridgeCode.replace(interceptorCode, '');
    fs.writeFileSync('src/services/apiBridge.ts', apiBridgeCode);
    console.log("Removed analyze-duty-doc interceptor from apiBridge");
} else {
    console.log("Could not find interceptor in apiBridge");
}
