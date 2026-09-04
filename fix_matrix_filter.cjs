const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const changeStr = `        {viewMode === 'DUTY_RATIO' && selectedFlightFilter === 'Overall' && matrix.map((table, tableIdx) => {`;
const newChangeStr = `        {viewMode === 'DUTY_RATIO' && selectedFlightFilter === 'Overall' && matrix.filter(t => !t.isDisabled).map((table, tableIdx) => {`;

code = code.replace(changeStr, newChangeStr);

const changeStr2 = `        {viewMode === 'DUTY_RATIO' && selectedFlightFilter !== 'Overall' && matrix.map((table, tableIdx) => {`;
const newChangeStr2 = `        {viewMode === 'DUTY_RATIO' && selectedFlightFilter !== 'Overall' && matrix.filter(t => !t.isDisabled).map((table, tableIdx) => {`;

code = code.replace(changeStr2, newChangeStr2);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
