const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

if (!content.includes("import { exportHtmlToWord }")) {
  content = content.replace("import { formatDutyOnShortName", "import { exportHtmlToWord } from '../utils/htmlExport';\nimport { formatDutyOnShortName");
  fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
}
