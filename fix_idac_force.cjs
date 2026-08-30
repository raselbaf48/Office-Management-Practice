const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const regex = /\s*\)\)\s*\n\s*\)\}\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*\)\}\s*\n\s*<\/div>\s*\n\s*\{\/\* Footer \*\/\}/g;

const replacement = `
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
