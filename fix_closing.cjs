const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Just remove extraneous `</div></div>)}` that are breaking things
// Wait, it's safer to just replace `</div>)}</div></div>)}` with `</div>)}`
content = content.replace(/<\/div>\)}<\/div><\/div>\)}/g, "</div>)}");

// Line 1118: ')' expected
// Line 1193: Declaration or statement expected

fs.writeFileSync(file, content);
