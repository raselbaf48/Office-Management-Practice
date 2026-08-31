const fs = require('fs');
let file = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

file = file.replace(/              <\/div>\n            <\/div>\n        <\/div>/g, 
`              </div>
            </div>
          )}
        </div>`);

fs.writeFileSync('src/components/SettingsModal.tsx', file, 'utf-8');
