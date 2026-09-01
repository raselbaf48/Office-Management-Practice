const fs = require('fs');
let lines = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8').split('\n');

// 456
lines.splice(456, 0, '                      )}');
lines.splice(775, 0, '                              )}');
lines.splice(784, 0, '                              )}');
lines.splice(788, 0, '                          )}');
lines.splice(812, 0, '                        )}');
lines.splice(825, 0, '                        )}');
lines.splice(840, 0, '                        )}');
lines.splice(855, 0, '                        )}');
lines.splice(867, 0, '                        )}');
lines.splice(915, 0, '                        )}');
lines.splice(935, 0, '                        )}');
lines.splice(958, 0, '                        )}');
lines.splice(971, 0, '                        )}');
lines.splice(986, 0, '                            )}');
lines.splice(1000, 0, '                        )}');
lines.splice(1015, 0, '                            )}');
lines.splice(1019, 0, '                      )}');
lines.splice(1023, 0, '            )}');
lines.splice(1025, 0, '          )}');

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', lines.join('\n'));
