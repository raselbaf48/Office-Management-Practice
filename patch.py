import re

with open('/tmp/pt.tsx', 'r') as f:
    code = f.read()

# 1. Rename component
code = code.replace("ParadeStateFormattedView", "NightCountStateView")

# 2. Add signature removal
code = re.sub(r'const \[showSignatureModal[^;]+;', '', code)
code = re.sub(r'const \[signatureInitialTab[^;]+;', '', code)
code = re.sub(r'const \[preparedBy[^;]+;', '', code)
code = re.sub(r'const \[authorizedBy[^;]+;', '', code)
code = re.sub(r'import \{ SignatureConfigModal, SignatureDetails.*?\} from \'./SignatureConfigModal\';', '', code)
code = re.sub(r'<button[^>]+onClick=\{[^>]+setShowSignatureModal\(true\)[^>]+>.*?</button>', '', code, flags=re.DOTALL)
code = re.sub(r'<SignatureConfigModal[^>]+/>', '', code)
code = re.sub(r'preparedBy=\{preparedBy\}', '', code)
code = re.sub(r'authorizedBy=\{authorizedBy\}', '', code)
code = re.sub(r'onOpenSignatureConfig=\{[^}]+\}', '', code)

# 3. Replace the table section
# Find the start of the table block
# PT State has two tables: multi-day and summary matrix.
# We replace both with the custom table!

new_table = """
          <div className="overflow-x-auto border border-slate-900 dark:border-slate-300 mb-8">
            <table className="w-full text-center border-collapse text-[11px] text-slate-900 dark:text-slate-100 table-fixed">
              <thead>
                <tr className="border-b border-slate-900 dark:border-slate-300">
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Sqn/Unit</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Total Str</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Det/Tdy</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Eff Str</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Leave</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Course</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Class/Exam</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>AWOL/Detention</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Sick report</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>ED/ EX PPGF</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>CMH/BNS/BSH/Qrnt</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>U/C, U/Board</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Office Duty</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Aft/Ni flg/Ni Duty</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>GD/TF/Airfield Duty</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Off Duty</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>K/O</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Mess/ Canteen /Bakery</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Driving</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Games /Guard of Honor</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Total Out Parade</th>
                  <th className="border-r border-slate-900 dark:border-slate-300 p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>On Parade</th>
                  <th className="p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-2 font-bold whitespace-nowrap">155 UASU BAF</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{totalStr || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{detTdy || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{effStr || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{leave || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{course || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{classExam || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{awolDet || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{sick || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{edEx || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{cmh || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{ucBoard || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{officeDuty || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{aftNiFlg || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{gdTf || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{offDuty || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{ko || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{mess || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{driving || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{games || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1">{totalOutParade || ''}</td>
                  <td className="border-r border-slate-900 dark:border-slate-300 p-1 font-bold">{onParade || ''}</td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
"""

start_multi_day = code.find('{/* MULTI-DAY SUMMARY TABLE')
end_summary_matrix = code.find('{/* MULTI-DAY SUMMARY MATRIX TABLE END */}')

if start_multi_day != -1 and end_summary_matrix != -1:
    # also remove any ending div of the summary matrix
    end_index = code.find('</div>', end_summary_matrix) + 6
    code = code[:start_multi_day] + new_table + code[end_index:]
else:
    print("Could not find table boundaries!")

# 4. Filter for L/In Cpl & Below ONLY
# In PT state, it's mapped over `selectedFlight` or `overall`. Let's just hook right at `const pList = `
# Wait, let's just create a custom filter.
filter_code = """
          let pList = selectedFlight === 'Overall'
            ? rawPersonnel
            : rawPersonnel.filter((s) => s.airman.flightName === selectedFlight);
          
          pList = pList.filter(item => {
            const a = item.airman;
            const isCplOrBelow = ['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank);
            if (!isCplOrBelow) return false;
            const block = (a.addressBlock || '').toLowerCase();
            const isLout = block.includes('qtr') || block.includes('quarter') || block.includes('outside');
            return !isLout;
          });
"""
code = re.sub(r'const pList = selectedFlight === \'Overall\'[^;]+;', filter_code, code, count=1)

# Ensure the Add Disposal Modal also uses the same filter!
# In the add disposal modal: airmen={airmen} -> airmen={airmen.filter(a => ['CPL','LAC','AC'].includes(a.rank.toUpperCase()) && !(a.addressBlock||'').toLowerCase().includes('qtr') && !(a.addressBlock||'').toLowerCase().includes('quarter') && !(a.addressBlock||'').toLowerCase().includes('outside'))}
add_disp_filter = """airmen={airmen.filter(a => ['CPL','LAC','AC'].includes(a.rank.toUpperCase()) && !(a.addressBlock||'').toLowerCase().includes('qtr') && !(a.addressBlock||'').toLowerCase().includes('quarter') && !(a.addressBlock||'').toLowerCase().includes('outside'))}"""
code = code.replace("airmen={airmen}", add_disp_filter)

# Change header text from "Parade State" to "Night Count State"
code = code.replace("BAF PARADE STATE", "BAF NIGHT COUNT STATE")

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)

print("Patched!")
