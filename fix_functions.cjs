const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const replacement = `  const handleRatioCalculated = (newMatrix: DutyRatioTable[]) => {
    setMatrix(newMatrix);
    saveDutyMatrix(newMatrix);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (`;

code = code.replace(
  '  return (',
  replacement
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
