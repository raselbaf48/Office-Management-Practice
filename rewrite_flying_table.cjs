const fs = require('fs');

const data = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// I need to replace from `<table` to `</table>`
const tableRegex = /<table[\s\S]*?<\/table>/;

const newTable = `<table className="w-full text-center border-collapse border border-black text-xs font-bold">
          <thead>
            <tr>
              <th className="border border-black p-1 w-24">Sqn/Unit</th>
              <th className="border border-black p-1 break-words w-8"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Total Str</div></th>
              <th className="border border-black p-1 break-words w-8"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Det/Tdy</div></th>
              <th className="border border-black p-1 break-words w-8"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Eff Str</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Leave</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Course</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Class/Exam</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">AWOL/Detention</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Sick report</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">ED/ EX PPGF</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">CMH/BNS/BSH/Qrnt</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">U/C, U/Board</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Office Duty</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Aft/Ni flg/Ni Duty/Flg</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">TF/Base/Airfield Duty</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Off Duty</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">K/O</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Mess/ Canteen /Bakery</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Driving</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">PT/Parade on Unit</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Games /Guard of Honor</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Total Out PT/Parade</div></th>
              <th className="border border-black p-1 break-words w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">On PT / Parade(Forecast)</div></th>
              <th className="border border-black p-1 w-16">Rmks</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((d, index) => {
              const effStr = (d.totalStr || 0) - (d.detTdy || 0);
              const totalOut = (d.leave || 0) + (d.edExPpgf || 0) + (d.cmhBnsBsh || 0) + (d.officeDuty || 0) + (d.baseAirfieldDuty || 0) + (d.driving || 0);
              const onPt = effStr - totalOut;

              total_totalStr += d.totalStr || 0;
              total_detTdy += d.detTdy || 0;
              total_effStr += effStr;
              total_leave += d.leave || 0;
              total_edEx += d.edExPpgf || 0;
              total_cmh += d.cmhBnsBsh || 0;
              total_office += d.officeDuty || 0;
              total_tfBase += d.baseAirfieldDuty || 0;
              total_driving += d.driving || 0;
              total_totalOut += totalOut;
              total_onPt += onPt;

              return (
                <tr key={index} className="hover:bg-slate-50 cursor-pointer" onClick={() => { if(d.unit !== '155 UASU BAF') openAddModal(d.unit); }}>
                  <td className="border border-black p-1 text-left pl-2 font-normal whitespace-nowrap">{d.unit}</td>
                  <td className="border border-black p-1 font-normal">{d.totalStr || ''}</td>
                  <td className="border border-black p-1 font-normal">{d.detTdy || ''}</td>
                  <td className="border border-black p-1 font-normal">{effStr || ''}</td>
                  <td className="border border-black p-1 font-normal">{d.leave || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal">{d.edExPpgf || ''}</td>
                  <td className="border border-black p-1 font-normal">{d.cmhBnsBsh || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal">{d.officeDuty || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal">{d.baseAirfieldDuty || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal">{d.driving || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal"></td>
                  <td className="border border-black p-1 font-normal">{totalOut || ''}</td>
                  <td className="border border-black p-1 font-normal">{onPt || ''}</td>
                  <td className="border border-black p-1 font-normal"></td>
                </tr>
              );
            })}
            <tr className="font-bold bg-slate-50">
              <td className="border border-black p-1 text-left pl-2">Total</td>
              <td className="border border-black p-1">{total_totalStr || 0}</td>
              <td className="border border-black p-1">{total_detTdy || 0}</td>
              <td className="border border-black p-1">{total_effStr || 0}</td>
              <td className="border border-black p-1">{total_leave || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_edEx || 0}</td>
              <td className="border border-black p-1">{total_cmh || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_office || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_tfBase || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_driving || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_totalOut || 0}</td>
              <td className="border border-black p-1">{total_onPt || 0}</td>
              <td className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>`;

const newData = data.replace(tableRegex, newTable);
fs.writeFileSync('src/components/FlyingWingStateView.tsx', newData, 'utf-8');
