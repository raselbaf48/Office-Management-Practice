const fs = require('fs');
let lines = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8').split('\n');

// Remove the garbage from 756-758
let idx = lines.findIndex(l => l.includes('      </div>') && lines[l+1] && lines[l+1].includes('    </div>') && lines[l+2] && lines[l+2].includes('                    );'));
// Actually, let's just do global replace
let text = lines.join('\n');
text = text.replace('                      </div>\n      </div>\n    </div>\n                    );\n                  })}', '                      </div>\n                    );\n                  })}');
text = text.replace('                      </div>\n      </div>\n    </div>\n                    );', '                      </div>\n                    );');
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', text);
