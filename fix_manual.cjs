const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// Undo the last insertions by replacing them
content = content.replace('          </div>\n          </div>\n        )}', '          </div>\n        )}');
content = content.replace('              </div>\n            );\n                </div>\n              </div>\n          })}', '                </div>\n              </div>\n            );\n          })}');
content = content.replace('              </div>\n            );\n              </div>\n          )}', '              </div>\n            </div>\n          )}');
content = content.replace('              </div>\n          </div>\n        )}', '              </div>\n          </div>\n        )}'); // wait let's just use regex

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content);
