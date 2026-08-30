const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const faultyStr = `              </div>
            </div>
          )}
        </div>
        {/* Footer */}`;

const fixedStr = `              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}`;

code = code.replace(faultyStr, fixedStr);
fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
