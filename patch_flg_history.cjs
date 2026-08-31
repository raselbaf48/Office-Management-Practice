const fs = require('fs');
let file = fs.readFileSync('src/components/FlgWgHistoryModal.tsx', 'utf-8');

const newContent = `import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Clock } from 'lucide-react';

interface FlgWgHistoryModalProps {
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

export const FlgWgHistoryModal: React.FC<FlgWgHistoryModalProps> = ({ onClose, onSelectDate }) => {
  const [historyItems, setHistoryItems] = useState<{ date: string; displayDate: string }[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load historical dates
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('flg_wg_data_')) {
        const dateStr = key.replace('flg_wg_data_', '');
        items.push(dateStr);
      }
    }
    
    // Sort descending
    items.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    setHistoryItems(items.map(date => ({
      date,
      displayDate: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    })));

    // Load ALL logs
    let allLogs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('flg_wg_logs_')) {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        const dateStr = key.replace('flg_wg_logs_', '');
        allLogs = [...allLogs, ...parsed.map((p: any) => ({ ...p, dateStr }))];
      }
    }
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(allLogs);
  }, []);

  const handleDelete = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    if (window.confirm(\`Are you sure you want to delete the history for \${date}?\`)) {
      localStorage.removeItem(\`flg_wg_data_\${date}\`);
      localStorage.removeItem(\`flg_wg_logs_\${date}\`);
      setHistoryItems(prev => prev.filter(item => item.date !== date));
      setLogs(prev => prev.filter(item => item.dateStr !== date));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Flying Wing History & Logs
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase tracking-wider">Saved Dates</h4>
            {historyItems.length === 0 ? (
              <div className="text-center text-slate-500 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                No historical data found.
              </div>
            ) : (
              <div className="space-y-2">
                {historyItems.map((item) => (
                  <div 
                    key={item.date} 
                    onClick={() => {
                      onSelectDate(item.date);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors group"
                  >
                    <div className="font-bold">
                      {item.displayDate}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item.date)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/2">
            <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase tracking-wider">Recent Disposals</h4>
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                No disposals recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{log.unit}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      {log.action}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Date: {log.dateStr}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/FlgWgHistoryModal.tsx', newContent, 'utf-8');
