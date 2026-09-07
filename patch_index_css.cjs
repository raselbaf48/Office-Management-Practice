const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace('#root, #root > div {', '#root {');
fs.writeFileSync('src/index.css', css, 'utf8');
console.log('Fixed index.css parent overrides');
