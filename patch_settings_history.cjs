const fs = require('fs');
let file = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

const importStr = "import { subscribeToActiveUsers, subscribeToLoginHistory } from '../services/presenceService';";
if (!file.includes('presenceService')) {
  file = file.replace("import { getLoginHistory, clearLoginHistory", importStr + "\\nimport { getLoginHistory, clearLoginHistory");
}

// Add state for active users and real-time history
const stateStr = `  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [realtimeHistory, setRealtimeHistory] = useState<any[]>([]);`;
if (!file.includes('activeUsers')) {
  file = file.replace("const [historySearch, setHistorySearch] = useState('');", "const [historySearch, setHistorySearch] = useState('');\\n" + stateStr);
}

// Add useEffect
const hookStr = `  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      const unsubUsers = subscribeToActiveUsers((users) => {
        setActiveUsers(users);
      });
      const unsubHistory = subscribeToLoginHistory((logs) => {
        setRealtimeHistory(logs);
      });
      return () => {
        unsubUsers();
        unsubHistory();
      };
    }
  }, [role]);`;
if (!file.includes('subscribeToActiveUsers')) {
  file = file.replace("useEffect(() => {", hookStr + "\\n\\n  useEffect(() => {");
}

const historyView = `          {activeSection === 'history' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6">
              
              {/* Active Users Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Currently Active Users ({activeUsers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeUsers.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No other active users</span>
                  ) : (
                    activeUsers.map(u => (
                      <div key={u.bdNo} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{u.rank} {u.name} (BD/{u.bdNo})</span>
                        <span className="text-[10px] text-slate-500">{u.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Realtime Login History Section */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search realtime logs..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white px-3 py-1 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto shadow-sm">
                {(() => {
                  const filtered = realtimeHistory.filter(log => {
                    if (!historySearch.trim()) return true;
                    const q = historySearch.toLowerCase();
                    return (
                      log.bdNo?.toLowerCase().includes(q) ||
                      log.name?.toLowerCase().includes(q) ||
                      log.rank?.toLowerCase().includes(q) ||
                      log.flightName?.toLowerCase().includes(q)
                    );
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold">No realtime login history found</p>
                      </div>
                    );
                  }
                  return filtered.map(log => (
                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex justify-between items-center">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {log.rank} {log.name}
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          BD/{log.bdNo} • {log.flightName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-xs font-bold text-slate-500">{log.role}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}`;

const oldHistoryView = /(?:\{activeSection === 'history' && role === 'SUPER_ADMIN' && \([\s\S]*?\}\)[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\))/;

file = file.replace(oldHistoryView, historyView);
fs.writeFileSync('src/components/SettingsModal.tsx', file, 'utf-8');
