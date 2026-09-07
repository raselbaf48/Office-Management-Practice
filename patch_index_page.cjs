const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace('size: A4 portrait;', '');
fs.writeFileSync('src/index.css', css, 'utf8');
console.log('Removed global portrait override');
