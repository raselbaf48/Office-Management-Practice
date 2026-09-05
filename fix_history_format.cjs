const fs = require('fs');

function fixHistoryFormat() {
  let file = 'src/components/AirmanProfileModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Add ATT to the filter logic
  code = code.replace(
    /if \(categoryFilter === 'DUTY'\) return !\['LEAVE', 'TDY', 'DUTY_OFF', 'ON_PARADE'\]\.includes\(a\.dutyCode\);/,
    `if (categoryFilter === 'DUTY') return !['LEAVE', 'TDY', 'ATT', 'DUTY_OFF', 'ON_PARADE'].includes(a.dutyCode);\n    if (categoryFilter === 'ATT') return a.dutyCode === 'ATT' || a.dutyCode === 'BAKE_N_BITE';`
  );

  // Add ATT to category toggle and hide it if historyOnly
  code = code.replace(
    /\{\/\* Category toggle \*\/\}\s*<div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-\[11px\] font-bold">\s*\{\(\['ALL', 'DUTY', 'LEAVE', 'TDY'\] as const\)\.map\(\(cat\) => \([\s\S]*?<\/div>/,
    `{/* Category toggle */}
                {!historyOnly && (
                  <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    {(['ALL', 'DUTY', 'LEAVE', 'TDY', 'ATT'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={\`px-2.5 py-1 rounded-lg transition-all \${
                          categoryFilter === cat
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }\`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}`
  );
  
  // Also hide counters summary if historyOnly
  code = code.replace(
    /\{\/\* Counters Summary \*\/\}\s*<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">/,
    `{/* Counters Summary */}
              {!historyOnly && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">`
  );

  code = code.replace(
    /<\/div>\s*\{\/\* Assignments Table \*\/\}/,
    `</div>\n              )}\n\n              {/* Assignments Table */}`
  );

  // Group logic and renderer for table
  const groupedLogic = `
  const getGroupedList = (list) => {
    if (list.length === 0) return [];
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const groups = [];
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const prev = currentGroup[currentGroup.length - 1];
      
      const currDate = new Date(current.date);
      const prevDate = new Date(prev.date);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1 && current.dutyCode === prev.dutyCode && current.notes === prev.notes) {
        currentGroup.push(current);
      } else {
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  const formatDateRange = (startDate, endDate) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatSingle = (dateStr) => {
      if(!dateStr) return '';
      const parts = dateStr.split('-');
      const d = parseInt(parts[2], 10);
      const m = months[parseInt(parts[1], 10) - 1];
      return \`\${d < 10 ? '0' + d : d} \${m}\`;
    };
    
    if (startDate === endDate) return formatSingle(startDate);
    return \`\${formatSingle(startDate)} - \${formatSingle(endDate)}\`;
  };

  const isGroupedView = categoryFilter === 'LEAVE' || categoryFilter === 'TDY' || categoryFilter === 'ATT';
  const groupedList = isGroupedView ? getGroupedList(filteredList) : [];
`;

  code = code.replace(
    /const filteredList = assignments\.filter/,
    `${groupedLogic}\n  const filteredList = assignments.filter`
  );

  // Table rendering replacement
  const tableReplacement = `
            {/* Assignments Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                {isGroupedView ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3.5">Ser No</th>
                        <th className="py-2.5 px-3.5">{categoryFilter === 'LEAVE' ? 'Leave Type' : 'Destination'}</th>
                        <th className="py-2.5 px-3.5">Period</th>
                        <th className="py-2.5 px-3.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={4} className="py-6 text-center text-slate-400">Loading duty history...</td></tr>
                      ) : groupedList.length === 0 ? (
                        <tr><td colSpan={4} className="py-6 text-center text-slate-400">No records found for this period.</td></tr>
                      ) : (
                        groupedList.map((group, idx) => {
                          const first = group[0];
                          const last = group[group.length - 1];
                          const typeOrDest = categoryFilter === 'LEAVE' ? (first.notes || 'Leave') : (first.notes || (categoryFilter === 'TDY' ? 'TDY' : 'Deployment'));
                          return (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              <td className="py-2.5 px-3.5 font-bold text-slate-700 dark:text-slate-300">
                                {typeOrDest}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                                {formatDateRange(first.date, last.date)}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                                {String(group.length).padStart(2, '0')} days
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3.5">Date</th>
                        <th className="py-2.5 px-3.5">Duty / Status</th>
                        <th className="py-2.5 px-3.5">Shift</th>
                        <th className="py-2.5 px-3.5">Remarks / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            Loading duty history...
                          </td>
                        </tr>
                      ) : filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            No duty or leave records found for this period.
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((item, idx) => {
                          const typeInfo = DUTY_TYPE_MAP[item.dutyCode];
                          return (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {item.date}
                              </td>
                              <td className="py-2.5 px-3.5">
                                <span
                                  className={\`px-2 py-0.5 rounded font-black text-[10px] \${
                                    typeInfo?.badgeBg || 'bg-slate-100'
                                  } \${typeInfo?.badgeText || 'text-slate-800'}\`}
                                >
                                  {typeInfo?.name || item.dutyCode}
                                </span>
                              </td>
                              <td className="py-2.5 px-3.5 font-semibold text-slate-600 dark:text-slate-400">
                                {item.shift || '-'}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400">
                                {item.notes || '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
`;

  code = code.replace(
    /\{\/\* Assignments Table \*\/\}\s*<div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">[\s\S]*?<\/div>/,
    tableReplacement
  );

  fs.writeFileSync(file, code);
}
fixHistoryFormat();
console.log('Fixed History Format');
