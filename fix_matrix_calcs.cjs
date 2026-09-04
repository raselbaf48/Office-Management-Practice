const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const changeStr3 = `  const totalSlotsOverall = matrix.reduce((sum, table) => {`;
const newChangeStr3 = `  const totalSlotsOverall = matrix.filter(t => !t.isDisabled).reduce((sum, table) => {`;
code = code.replace(changeStr3, newChangeStr3);

const changeStr4 = `      matrix.forEach(table => {`;
const newChangeStr4 = `      matrix.filter(t => !t.isDisabled).forEach(table => {`;
code = code.replace(changeStr4, newChangeStr4);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
