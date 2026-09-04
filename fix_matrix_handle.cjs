const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const changeStr = `  const handleRatioCalculated = (newMatrix: DutyRatioTable[]) => {
    setMatrix(newMatrix);
    saveDutyMatrix(newMatrix);
  };`;

code = code.replace(changeStr, '');

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
