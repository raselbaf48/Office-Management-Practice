import re

with open('src/components/ParadeStateFormattedView.tsx', 'r') as f:
    content = f.read()

# 1. Add hideEmptyColumns state
content = re.sub(
    r"(const \[toDate, setToDate\] = useState<string>\(selectedDate\);)",
    r"\1\n  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);",
    content
)

# 2. Add hideEmptyColumns checkbox to UI (only if isMultiDay)
checkbox_ui = """
        {isMultiDay && (
          <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 ml-4 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="w-3.5 h-3.5 cursor-pointer accent-emerald-600" 
              checked={hideEmptyColumns}
              onChange={(e) => setHideEmptyColumns(e.target.checked)}
            />
            <span>Hide Empty Columns</span>
          </label>
        )}
        {/* Official Export / Print Button */}"""

content = content.replace(
    "{/* Official Export / Print Button */}",
    checkbox_ui
)

# 3. Process Multi Day Custom Disposals
custom_disp_logic = """
                    const onParade = pList.filter((s) => s.dutyCode === 'ON_PARADE' || s.statusCategory === 'PARADE');

                    // Extract custom disposals for this specific day
                    const dayCustomDisposals: Record<string, typeof pList> = {};
                    pList.forEach(item => {
                      const codeUpper = (item.dutyCode || '').toUpperCase();
                      const statusCategory = item.statusCategory;
                      const notes = item.notes || '';
                      const notesLower = notes.toLowerCase();

                      const isBaseSec = codeUpper === 'GD' || notesLower.includes('base sec');
                      const isBtf = codeUpper === 'BTF';
                      const isNtf = codeUpper === 'NTF';
                      const isAirfield = codeUpper === 'AIRPORT' || codeUpper === 'AIR_FD' || notesLower.includes('airfield') || notesLower.includes('air fd');
                      const isHalishahar = codeUpper === 'HALISHAHAR';
                      const isBakeBite = codeUpper === 'BAKE_BITE' || codeUpper === 'BAKE_N_BITE' || statusCategory === 'BAKE_N_BITE';
                      const isTdy = ['TDY', 'ATT', 'DETT'].includes(codeUpper);
                      const isLeave = codeUpper === 'LEAVE';
                      const isIda = ['IDAC', 'IDA'].includes(codeUpper);
                      const isDutyOff = codeUpper === 'DUTY_OFF' || statusCategory === 'OFF';
                      const isOnParadeFlag = codeUpper === 'ON_PARADE' || statusCategory === 'PARADE';

                      if (!isBaseSec && !isBtf && !isNtf && !isAirfield && !isHalishahar && !isBakeBite && !isTdy && !isLeave && !isIda && !isDutyOff && !isOnParadeFlag) {
                          let customKey = codeUpper === 'OTHERS' ? (notes || 'OTHER DISPOSAL') : (item.dutyName || item.dutyCode || 'OTHER DISPOSAL');
                          if (notes) {
                             if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) {
                               customKey = notes;
                             }
                          }
                          if (!dayCustomDisposals[customKey]) dayCustomDisposals[customKey] = [];
                          dayCustomDisposals[customKey].push(item);
                      }
                    });
"""
content = re.sub(
    r"const onParade = pList.filter\(\(s\) => s\.dutyCode === 'ON_PARADE' \|\| s\.statusCategory === 'PARADE'\);",
    custom_disp_logic,
    content
)

# Generate multiDayCustomDisposalsSet before rendering table
multi_day_prep = """                  {/* DOCUMENT TOP HEADER */}
                  {(() => {
                     const allCustomKeys = new Set<string>();
                     if (isMultiDay) {
                       datesInRange.forEach(dStr => {
                         const resData = multiDayStates[dStr];
                         const rawPersonnel = resData?.personnelStatusList || [];
                         const pList = selectedFlight === 'Overall' ? rawPersonnel : rawPersonnel.filter((s) => s.airman.flightName === selectedFlight);
                         pList.forEach(item => {
                            const codeUpper = (item.dutyCode || '').toUpperCase();
                            const statusCategory = item.statusCategory;
                            const notes = item.notes || '';
                            const notesLower = notes.toLowerCase();

                            const isBaseSec = codeUpper === 'GD' || notesLower.includes('base sec');
                            const isBtf = codeUpper === 'BTF';
                            const isNtf = codeUpper === 'NTF';
                            const isAirfield = codeUpper === 'AIRPORT' || codeUpper === 'AIR_FD' || notesLower.includes('airfield') || notesLower.includes('air fd');
                            const isHalishahar = codeUpper === 'HALISHAHAR';
                            const isBakeBite = codeUpper === 'BAKE_BITE' || codeUpper === 'BAKE_N_BITE' || statusCategory === 'BAKE_N_BITE';
                            const isTdy = ['TDY', 'ATT', 'DETT'].includes(codeUpper);
                            const isLeave = codeUpper === 'LEAVE';
                            const isIda = ['IDAC', 'IDA'].includes(codeUpper);
                            const isDutyOff = codeUpper === 'DUTY_OFF' || statusCategory === 'OFF';
                            const isOnParadeFlag = codeUpper === 'ON_PARADE' || statusCategory === 'PARADE';

                            if (!isBaseSec && !isBtf && !isNtf && !isAirfield && !isHalishahar && !isBakeBite && !isTdy && !isLeave && !isIda && !isDutyOff && !isOnParadeFlag) {
                                let customKey = codeUpper === 'OTHERS' ? (notes || 'OTHER DISPOSAL') : (item.dutyName || item.dutyCode || 'OTHER DISPOSAL');
                                if (notes) {
                                   if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) {
                                     customKey = notes;
                                   }
                                }
                                allCustomKeys.add(customKey);
                            }
                         });
                       });
                     }
                     const customKeysArray = Array.from(allCustomKeys);
                     
                     // Hide empty logic
                     const hasData = (dutyName: string) => {
                       if (!hideEmptyColumns) return true;
                       return datesInRange.some(dStr => {
                         const resData = multiDayStates[dStr];
                         const pList = selectedFlight === 'Overall' ? (resData?.personnelStatusList || []) : (resData?.personnelStatusList || []).filter(s => s.airman.flightName === selectedFlight);
                         if (dutyName === 'Halishahar Duty') return pList.some(s => s.dutyCode === 'HALISHAHAR');
                         if (dutyName === 'Bake N Bite') return pList.some(s => s.dutyCode === 'BAKE_BITE' || s.dutyCode === 'BAKE_N_BITE' || s.statusCategory === 'BAKE_N_BITE');
                         if (dutyName === 'Base Security Duty') return pList.some(s => s.dutyCode === 'GD' || s.notes?.toLowerCase().includes('base sec'));
                         if (dutyName === 'Base Taskforce Duty') return pList.some(s => s.dutyCode === 'BTF');
                         if (dutyName === 'Najirpara Taskforce Duty') return pList.some(s => s.dutyCode === 'NTF');
                         if (dutyName === 'Airfield Duty') return pList.some(s => s.dutyCode === 'AIRPORT' || s.dutyCode === 'AIR_FD' || s.notes?.toLowerCase().includes('airfield') || s.notes?.toLowerCase().includes('air fd'));
                         if (dutyName === 'Tdy') return pList.some(s => ['TDY', 'ATT', 'DETT'].includes(s.dutyCode));
                         if (dutyName === 'Leave') return pList.some(s => s.dutyCode === 'LEAVE');
                         
                         return true; // Keep others visible
                       });
                     };
                     
                     return (
                     <div className="overflow-x-auto my-3">
"""
content = content.replace("{/* DOCUMENT TOP HEADER */}", """{/* DOCUMENT TOP HEADER */}""")
content = content.replace("""            <div className="overflow-x-auto my-3">""", multi_day_prep)
content = content.replace("""              </table>\n            </div>\n            {/* SPACER ROW: 0.6 INCH HEIGHT TO PROVIDE SIGNATURE HEADROOM */}""", """              </table>\n            </div>\n            ); })()} \n            {/* SPACER ROW: 0.6 INCH HEIGHT TO PROVIDE SIGNATURE HEADROOM */}""")

# 4. Modify multi-day Headers
multi_day_headers = """
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900">
                    <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Date</th>
                    <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Day</th>
                    {hasData('Base Security Duty') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Base Security Duty</th>}
                    {hasData('Base Taskforce Duty') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Base Taskforce Duty</th>}
                    {hasData('Najirpara Taskforce Duty') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Najirpara Taskforce Duty</th>}
                    {hasData('Airfield Duty') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Airfield Duty</th>}
                    {hasData('Halishahar Duty') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Halishahar Duty</th>}
                    {hasData('Bake N Bite') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Bake N Bite</th>}
                    {hasData('Tdy') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Tdy</th>}
                    {customKeysArray.map(key => <th key={key} className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>{key}</th>)}
                    {hasData('Leave') && <th className="border border-slate-800 p-1.5 text-center align-middle" rowSpan={2}>Leave</th>}
                    <th className="border border-slate-800 p-1.5 text-center align-middle" colSpan={3}>IDA CENTER Duty</th>
"""
content = re.sub(
    r"""<tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900">\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Date</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Day</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Base Security Duty</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Base Taskforce Duty</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Najirpara Taskforce Duty</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Airfield Duty</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Halishahar Duty</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Bake N Bite</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Tdy</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" rowSpan=\{2\}>Leave</th>\s*<th className="border border-slate-800 p-1\.5 text-center align-middle" colSpan=\{3\}>IDA CENTER Duty</th>""",
    multi_day_headers.strip(),
    content
)

# 5. Modify multi-day Cells
multi_day_cells = """
                        <td className="border border-slate-800 p-1.5 whitespace-nowrap text-center align-middle">
                          {dayName}
                        </td>
                        {hasData('Base Security Duty') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(baseSec)}
                        </td>}
                        {hasData('Base Taskforce Duty') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(btf)}
                        </td>}
                        {hasData('Najirpara Taskforce Duty') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(ntf)}
                        </td>}
                        {hasData('Airfield Duty') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(airfield)}
                        </td>}
                        {hasData('Halishahar Duty') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(halishahar)}
                        </td>}
                        {hasData('Bake N Bite') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(bakeBite)}
                        </td>}
                        {hasData('Tdy') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(tdy)}
                        </td>}
                        {customKeysArray.map(key => (
                          <td key={key} className="border border-slate-800 p-1.5 text-center align-middle">
                            {renderAirmanColumnList(dayCustomDisposals[key] || [])}
                          </td>
                        ))}
                        {hasData('Leave') && <td className="border border-slate-800 p-1.5 text-center align-middle">
                          {renderAirmanColumnList(leave)}
                        </td>}
                        <td className="border border-slate-800 p-1.5 text-center align-middle">
"""
content = re.sub(
    r"""<td className="border border-slate-800 p-1\.5 whitespace-nowrap text-center align-middle">\s*\{dayName\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(baseSec\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(btf\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(ntf\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(airfield\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(halishahar\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(bakeBite\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(tdy\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">\s*\{renderAirmanColumnList\(leave\)\}\s*</td>\s*<td className="border border-slate-800 p-1\.5 text-center align-middle">""",
    multi_day_cells.strip(),
    content
)

# 6. Fix Prepared By / Authorized By layout (Name = font Block / uppercase, Rank = Normal, Designation = Normal, Unit = Uppercase)
sig1 = """
                <div className="border-t border-slate-900 pt-1.5">
                  <div className="text-xs uppercase font-black">{preparedBy.name}</div>
                  <div className="text-[11px] font-normal">{preparedBy.rank}</div>
                  <div className="text-[11px] font-normal">{preparedBy.designation}</div>
                  <div className="text-[10px] uppercase font-bold">{preparedBy.unit || '155 UASU BAF'}</div>
                </div>
"""
content = re.sub(
    r'<div className="border-t border-slate-900 pt-1\.5">\s*<div className="text-xs uppercase font-black">\{preparedBy\.name\}</div>\s*<div className="text-\[11px\] font-bold uppercase">\{preparedBy\.rank\}</div>\s*<div className="text-\[11px\] font-normal">\{preparedBy\.designation\}</div>\s*<div className="text-\[10px\] font-normal">\{preparedBy\.unit \|\| \'155 UASU BAF\'\}</div>\s*</div>',
    sig1.strip(),
    content
)

sig2 = """
                <div className="border-t border-slate-900 pt-1.5">
                  <div className="text-xs uppercase font-black">{authorizedBy.name}</div>
                  <div className="text-[11px] font-normal">{authorizedBy.rank}</div>
                  <div className="text-[11px] font-normal">{authorizedBy.designation}</div>
                  <div className="text-[10px] uppercase font-bold">{authorizedBy.unit || '155 UASU BAF'}</div>
                </div>
"""
content = re.sub(
    r'<div className="border-t border-slate-900 pt-1\.5">\s*<div className="text-xs uppercase font-black">\{authorizedBy\.name\}</div>\s*<div className="text-\[11px\] font-bold uppercase">\{authorizedBy\.rank\}</div>\s*<div className="text-\[11px\] font-normal">\{authorizedBy\.designation\}</div>\s*<div className="text-\[10px\] font-normal">\{authorizedBy\.unit \|\| \'155 UASU BAF\'\}</div>\s*</div>',
    sig2.strip(),
    content
)

with open('src/components/ParadeStateFormattedView.tsx', 'w') as f:
    f.write(content)

print("Patch applied successfully.")
