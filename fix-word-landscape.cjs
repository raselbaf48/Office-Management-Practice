const fs = require('fs');
let content = fs.readFileSync('src/utils/htmlExport.ts', 'utf8');

const replacementCss = `
        @page WordSection1 {
          size: 841.9pt 595.3pt; /* A4 landscape dimensions */
          mso-page-orientation: landscape;
          margin: 36.0pt 36.0pt 36.0pt 36.0pt;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        
        body, table, td, th, div, span, p, li { 
          font-family: Arial, sans-serif !important; 
          font-size: 12pt !important; 
          color: black; 
        }
        
        /* Keep headers slightly larger and bold */
        h1, h2, h3, .text-lg, .text-xl, .text-base {
          font-size: 14pt !important;
          font-weight: bold !important;
        }
`;

content = content.replace(/@page \{ size: A4 landscape; mso-page-orientation: landscape; margin: 8mm 12mm; \}\s*body \{ font-family: Arial, sans-serif; font-size: 11pt; color: black; background: white; \}/, replacementCss.trim());

// also wrap the body content in the WordSection1 div
content = content.replace('<body>\n      ${clone.innerHTML}\n    </body>', '<body>\n      <div class="WordSection1">\n        ${clone.innerHTML}\n      </div>\n    </body>');

fs.writeFileSync('src/utils/htmlExport.ts', content);
console.log("Updated htmlExport.ts landscape and font.");
