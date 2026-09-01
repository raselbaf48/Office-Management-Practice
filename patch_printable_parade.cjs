const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const headerTarget = `                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                            ESSN
                          </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                            CMH
                          </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Sick Report
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Recep- tion
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Canteen</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Guard Duty
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Bake & Bite
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Flood Cell
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Admin Order</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Deten- tion
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Class/Trg</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Air Fd Duty
                        </div>
                      </th>
                      
                    {Object.keys(customDisposalsMap).map(key => (`;

const headerReplace = `                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Essn</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">CMH/BNS/BSH</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Sick Report</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Drill Cat-C</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Guard Duty On/Off</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Canteen</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Bake & Bite</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">K/O & Reception</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Guard of Honour</div>
                      </th>
                      
                    {Object.keys(customDisposalsMap).map(key => (`;

code = code.replace(headerTarget, headerReplace);

const footerHeaderTarget = `                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Games
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Absent
                        </div>
                      </th>`;
                      
const footerHeaderReplace = ``;
code = code.replace(footerHeaderTarget, footerHeaderReplace);

const dataTarget = `                          <td className="border border-black p-0.5 text-center align-middle">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.floodCellCount > 0 ? stats.floodCellCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.detentionCount > 0 ? stats.detentionCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.classTrgCount > 0 ? stats.classTrgCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.airFdDutyCount > 0 ? stats.airFdDutyCount : '-'}</td>
                          {Object.keys(customDisposalsMap).map(key => {      const count = customDisposalsMap[key].length;      return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;    })}
                        {Object.keys(customDisposalsMap).map(key => {
                      const count = customDisposalsMap[key].length;
                      return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;
                    })}
                    <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.totalOutPt}</td>          
                    <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.onPtParadeCount}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.absentCount > 0 ? stats.absentCount : '-'}</td>`;
                          
const dataReplace = `                          <td className="border border-black p-0.5 text-center align-middle">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                          {Object.keys(customDisposalsMap).map(key => {
                            const count = customDisposalsMap[key].length;
                            return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;
                          })}
                          <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.totalOutPt}</td>
                          <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.onPtParadeCount}</td>`;

code = code.replace(dataTarget, dataReplace);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Patched PrintableParadeStateModal.tsx');
