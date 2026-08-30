const fs = require('fs');

let file = 'src/components/PrintableParadeStateModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  let oldBlock = `{onPtList.length > 0 ? (
                          <div className="flex items-start space-x-3 w-full">
                            <ol className="space-y-0.5 font-normal leading-tight w-1/2 overflow-hidden text-[11px]">
                              {onPtList.slice(0, 15).map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                            {onPtList.length > 15 && (
                              <ol className="space-y-0.5 font-normal leading-tight w-1/2 overflow-hidden text-[11px]">
                                {onPtList.slice(15).map((item, idx) => (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {16 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ) : (`.replace(/\r\n/g, '\n');

  let newBlock = `{onPtList.length > 0 ? (
                          <div className="flex items-start space-x-1 w-full">
                            <ol className="space-y-0.5 font-normal leading-tight w-1/3 overflow-hidden text-[11px]">
                              {onPtList.slice(0, 15).map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                            {onPtList.length > 15 && (
                              <ol className="space-y-0.5 font-normal leading-tight w-1/3 overflow-hidden text-[11px]">
                                {onPtList.slice(15, 30).map((item, idx) => (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {16 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                  </li>
                                ))}
                              </ol>
                            )}
                            {onPtList.length > 30 && (
                              <ol className="space-y-0.5 font-normal leading-tight w-1/3 overflow-hidden text-[11px]">
                                {onPtList.slice(30, 45).map((item, idx) => (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {31 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ) : (`.replace(/\r\n/g, '\n');

  // Normalize windows newlines just in case
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(file, content);
}
