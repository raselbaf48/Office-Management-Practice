const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const scrollbarCss = `
/* Hide scrollbars globally */
::-webkit-scrollbar {
  display: none;
}
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* Global Table Alternating Row Colors */
@media screen {
  tbody tr:nth-child(even) {
    background-color: rgb(248 250 252 / 0.7); /* slate-50/70 */
  }
  tbody tr:nth-child(odd) {
    background-color: #ffffff;
  }
  
  @media (prefers-color-scheme: dark) {
    .dark tbody tr:nth-child(even) {
      background-color: rgb(30 41 59 / 0.5); /* slate-800/50 */
    }
    .dark tbody tr:nth-child(odd) {
      background-color: #0f172a; /* slate-900 */
    }
  }
}
`;

if (!css.includes('::-webkit-scrollbar')) {
    css += '\n' + scrollbarCss;
    fs.writeFileSync('src/index.css', css);
    console.log("Added global CSS rules for scrollbars and alternating rows.");
} else {
    console.log("CSS already contains scrollbar rules.");
}
