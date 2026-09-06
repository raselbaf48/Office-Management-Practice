const fs = require('fs');

let content = fs.readFileSync('src/components/PdfDutyImportModal.tsx', 'utf8');

content = content.replace(/AI Multi-Page PDF & Duty Data Import/g, "OCR / Text Duty Data Import");
content = content.replace(/The AI will parse dates/g, "The system will use OCR and Regex to parse dates");
content = content.replace(/Multi-Page AI Analysis in Progress\.\.\./g, "Multi-Page OCR/Text Analysis in Progress...");
content = content.replace(/AI parsing depends on clear inputs/g, "OCR/Text parsing depends on clear inputs");

fs.writeFileSync('src/components/PdfDutyImportModal.tsx', content);
