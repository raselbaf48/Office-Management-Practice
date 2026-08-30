const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const col3Start = `{/* 3rd Column: 21% -> ATT/TDY/DETT, RECEPTION, AIR FD DUTY, ADMIN ORDER, CLASS/TRG, DRILL CAT-C */}`;
const col4End = `{/* SPACER ROW BETWEEN 1ST & 2ND ROWS: Ample room for manual / digital signatures */}`;

const newCols = `                      {/* 3rd & 4th Column: Disposals (Dynamically Split) */}
                      <td
                        style={{
                          width: '21%',
                          verticalAlign: 'top',
                          border: 'none',
                          paddingRight: '12px',
                        }}
                      >
                        {otherDisposals.slice(0, Math.ceil(otherDisposals.length / 2)).map((cat, cIdx) => (
                          <div key={cIdx} className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              {cat.title}
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {cat.airmen.map((a, aIdx) => (
                                <li key={aIdx} className="whitespace-nowrap truncate">
                                  {aIdx + 1}. {a.rank} {a.name.split(' ').pop()}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </td>
                      <td
                        style={{
                          width: '22%',
                          verticalAlign: 'top',
                          border: 'none',
                        }}
                      >
                        {dutyOnList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              DUTY ON
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {dutyOnList.map((item, idx) => {
                                const noteText = item.note || 'GD';
                                return (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {idx + 1}. {item.airman.rank} {item.airman.name.split(' ').pop()} - {noteText}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                        {documentType !== 'PT' && dutyOffList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              DUTY OFF
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {dutyOffList.map((item, idx) => {
                                let dNote = item.note || 'GD Off';
                                if (dNote.toLowerCase().includes('imported')) dNote = 'GD Off';
                                dNote = dNote.replace(/\\s*\\(?\\b\\d{4,}\\b\\)?/gi, '').replace(/\\s*\\(dt\\s*\\d*\\)/gi, '(dt)').trim();
                                if (!dNote.toLowerCase().endsWith('off') && !dNote.toLowerCase().includes('off')) {
                                  dNote = \`\${dNote} Off\`;
                                }
                                return (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {idx + 1}. {item.airman.rank} {item.airman.name.split(' ').pop()} - {dNote}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                        {otherDisposals.slice(Math.ceil(otherDisposals.length / 2)).map((cat, cIdx) => (
                          <div key={cIdx} className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              {cat.title}
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {cat.airmen.map((a, aIdx) => (
                                <li key={aIdx} className="whitespace-nowrap truncate">
                                  {aIdx + 1}. {a.rank} {a.name.split(' ').pop()}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </td>
                    </tr>
                    `;

let startIndex = code.indexOf(col3Start);
let endIndex = code.indexOf(col4End, startIndex);
if(startIndex > -1 && endIndex > -1) {
  code = code.substring(0, startIndex) + newCols + code.substring(endIndex);
} else {
  console.log("Could not find column rendering logic");
}

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
