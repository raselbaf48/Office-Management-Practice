const fs = require('fs');

let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// Update disposal options lists
code = code.replace(
  /{ code: 'TDY', label: 'ATT \/ TDY \/ DETT' },\n\s+{ code: 'ADMIN_ORDER', label: 'Admin Order \/ BOI' },\n\s+{ code: 'CLASS_TRG', label: 'Class \/ Trg Ctrl' },\n\s+{ code: 'ATT', label: 'Airfield Duty' },/g,
  "{ code: 'ATT', label: 'Attachment (ATT)' },\n                    { code: 'TDY', label: 'TDY' },\n                    { code: 'DETT', label: 'Detachment (DETT)' },\n                    { code: 'ADMIN_ORDER', label: 'Admin Order / BOI' },\n                    { code: 'CLASS_TRG', label: 'Class / Trg Ctrl' },"
);

code = code.replace(
  /{ code: 'TDY', label: 'ATT \/ TDY \/ DETT' },\n\s+{ code: 'ADMIN_ORDER', label: 'Admin Order' },\n\s+{ code: 'CLASS_TRG', label: 'Class \/ Trg Ctrl' },\n\s+{ code: 'ATT', label: 'Airfield Duty' },/g,
  "{ code: 'ATT', label: 'Attachment (ATT)' },\n                    { code: 'TDY', label: 'TDY' },\n                    { code: 'DETT', label: 'Detachment (DETT)' },\n                    { code: 'ADMIN_ORDER', label: 'Admin Order' },\n                    { code: 'CLASS_TRG', label: 'Class / Trg Ctrl' },"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
