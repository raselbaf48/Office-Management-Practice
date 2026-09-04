const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// replace the block we just added
css = css.replace(/@media screen {[\s\S]*}/, `@media screen {
  tbody tr:nth-child(even) {
    background-color: rgb(248 250 252 / 0.7);
  }
  tbody tr:nth-child(odd) {
    background-color: #ffffff;
  }
  
  html.dark tbody tr:nth-child(even),
  .dark tbody tr:nth-child(even) {
    background-color: rgb(30 41 59 / 0.5);
  }
  
  html.dark tbody tr:nth-child(odd),
  .dark tbody tr:nth-child(odd) {
    background-color: #0f172a;
  }
}`);

fs.writeFileSync('src/index.css', css);
console.log("Updated CSS block");
