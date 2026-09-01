const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const regexColgroup = /<colgroup>[\s\S]*?<\/colgroup>/;
code = code.replace(regexColgroup, ''); // just remove colgroup or let it automatically scale

const theadRegex = /<thead>[\s\S]*?<\/thead>/;
const newThead = `<thead>
                    <tr style={{ height: '78px' }} className="border border-black bg-white">
                      <th className="border border-black p-0.5 align-middle text-center font-bold text-[10px]">
                        Unit
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Total Str</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Eff Str</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Leave</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
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
                      {Object.keys(customDisposalsMap).map(key => (
                      <th key={key} className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          {key}
                        </div>
                      </th>
                    ))}
                    <th className="border border-black p-0.5 align-middle text-center font-extrabold"><div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">{documentType === 'PT' ? 'Total Out PT' : 'Total Out Parade'}</div></th>
                    <th className="border border-black p-0 align-bottom text-center font-bold align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          {documentType === 'PT' ? 'On PT' : 'On Parade'}
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Rmk
                        </div>
                      </th>
                    </tr>
                  </thead>`;

code = code.replace(theadRegex, newThead);

const tbodyRegex = /<tbody>[\s\S]*?<\/tbody>/;
const newTbody = `<tbody>
                    {(() => {
                      const stats = getFlightStats(currentFlight);
                      const unitLabel = '155 UASU BAF';
                      return (
                        <tr className="text-black border border-black bg-white text-[10px]">
                          <td className="border border-black p-0.5 text-center font-bold whitespace-nowrap align-middle">
                            {unitLabel}
                          </td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.totalStr}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.effStr}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.leaveCount > 0 ? stats.leaveCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                          {Object.keys(customDisposalsMap).map(key => (
                            <td key={key} className="border border-black p-0.5 text-center align-middle">
                              {customDisposalsMap[key].length > 0 ? customDisposalsMap[key].length : '-'}
                            </td>
                          ))}
                          <td className="border border-black p-0.5 text-center align-middle font-bold text-sm bg-gray-200">
                            {stats.totalOutParade > 0 ? stats.totalOutParade : '-'}
                          </td>
                          <td className="border border-black p-0.5 text-center align-middle font-bold text-sm bg-green-100">
                            {stats.onParade > 0 ? stats.onParade : '-'}
                          </td>
                          <td className="border border-black p-0.5 text-center align-middle"></td>
                        </tr>
                      );
                    })()}
                  </tbody>`;

code = code.replace(tbodyRegex, newTbody);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
