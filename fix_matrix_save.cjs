const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const changeStr = `  const handleSave = () => {
    saveDutyMatrix(matrix);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };`;

const newChangeStr = `  const handleRatioCalculated = (newMatrix: DutyRatioTable[]) => {
    setMatrix(newMatrix);
    saveDutyMatrix(newMatrix);
  };

  const handleSave = () => {
    saveDutyMatrix(matrix);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };`;

code = code.replace(changeStr, newChangeStr);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
