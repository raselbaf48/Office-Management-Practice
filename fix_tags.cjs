const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The regex I used was: /<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g
// It replaced them with "</div>)}"
// I should just find all "</div>)}" and replace them with "</div>\n</div>\n</div>\n)}" where appropriate? No, that's dangerous.
// Let's restore the whole SettingsModal right column manually.
