const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const errorStr = `                )}
              </div>
            ) : ()}
          </div>
        )}`;

const newStr = `                )}
              </div>
            )}
          </div>
        )}`;

code = code.replace(errorStr, newStr);
fs.writeFileSync('src/components/Sidebar.tsx', code);
