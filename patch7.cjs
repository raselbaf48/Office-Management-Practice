const fs = require('fs');
let code = fs.readFileSync('src/services/apiBridge.ts', 'utf8');

const target = `    if (pathname === '/api/roster/undo-history') {
      const { historyId } = body || {};
      const ok = localDb.undoHistory(historyId);
      return jsonResponse({ success: ok });
    }`;

const replacement = `    if (pathname === '/api/roster/undo-history') {
      const { historyId } = body || {};
      const ok = localDb.undoHistory(historyId);
      return jsonResponse({ success: ok });
    }
    if (pathname === '/api/system/log-action') {
      const { airmanId, airmanName, description } = body || {};
      localDb.logSystemAction(airmanId, airmanName, description);
      return jsonResponse({ success: true });
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/apiBridge.ts', code);
