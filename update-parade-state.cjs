const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

content = content.replace("import { exportParadeStateSingleDocx", "import { exportHtmlToWord } from '../utils/htmlExport';\nimport { exportParadeStateSingleDocx");

const handleStart = content.indexOf('const handleDownloadDocx = async () => {');
const nextFunc = content.indexOf('const getPdfTitle = () => {');

const replacement = `const handleDownloadDocx = async () => {
    const filename = \`\${isPtDocument ? 'PT' : 'Parade'}_State_155_UASU_BAF.doc\`;
    exportHtmlToWord('print-parade-state-content', filename);
  };

  `;

content = content.slice(0, handleStart) + replacement + content.slice(nextFunc);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
