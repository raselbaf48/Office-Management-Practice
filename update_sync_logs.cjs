const fs = require('fs');
let content = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// Add SyncLog type
const syncLogInterface = `
export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'PULL' | 'PUSH' | 'MANUAL';
  status: 'SUCCESS' | 'ERROR';
  message: string;
}
`;

if (!content.includes('export interface SyncLog')) {
  content = content.replace('export interface FirebaseSyncStatusState', syncLogInterface + 'export interface FirebaseSyncStatusState');
}

// Add sync logs state
if (!content.includes('let syncLogs: SyncLog[] = [];')) {
  content = content.replace('let firebaseLastSyncTime: string | null = null;', 'let firebaseLastSyncTime: string | null = null;\nlet syncLogs: SyncLog[] = JSON.parse(typeof window !== "undefined" ? window.localStorage.getItem("baf_sync_logs") || "[]" : "[]");\n\nexport const getSyncLogs = () => syncLogs;\nexport const addSyncLog = (log: Omit<SyncLog, "id">) => {\n  const newLog = { ...log, id: "sync-" + Date.now() + Math.random() };\n  syncLogs = [newLog, ...syncLogs].slice(0, 10);\n  if (typeof window !== "undefined") {\n    window.localStorage.setItem("baf_sync_logs", JSON.stringify(syncLogs));\n    window.dispatchEvent(new CustomEvent("baf_sync_logs_updated", { detail: syncLogs }));\n  }\n};\n');
}

fs.writeFileSync('src/services/localDatabase.ts', content);
