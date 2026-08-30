const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

// Find everything from the last ")) \n )}" down to "Save & Done"
const regex = /\)\)\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\{\/\* Footer \*\/\}| \)\)\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\{\/\* Footer \*\/\}| \)\)\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\{\/\* Footer \*\/\}/g;

// I will just use indexOf and substring
const start = code.indexOf('))', code.indexOf('handleDeleteResponsibility'));
const end = code.indexOf('{/* Footer */}');

if (start !== -1 && end !== -1) {
  const newEnd = `))
                )}
              </div>
            )}
          </div>
        </div>
        `;
  
  code = code.substring(0, start) + newEnd + code.substring(end);
}

fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
