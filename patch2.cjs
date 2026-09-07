const fs = require('fs');
let code = fs.readFileSync('src/services/apiBridge.ts', 'utf8');

const target = `    if (pathname === '/api/roster/undo-history') {
      return jsonResponse(db.undoHistoryEntry(body.historyId));
    }`;

const replacement = `    if (pathname === '/api/roster/undo-history') {
      return jsonResponse(db.undoHistoryEntry(body.historyId));
    }
    if (pathname === '/api/system/log-action') {
      const { airmanId, airmanName, description } = body;
      db.logSystemAction(airmanId, airmanName, description);
      return jsonResponse({ success: true });
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/apiBridge.ts', code);
