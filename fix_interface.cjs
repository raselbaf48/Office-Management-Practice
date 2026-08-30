const fs = require('fs');

let code = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

code = code.replace(
  /totalRequiredMonth: number;/g,
  'totalRequiredMonth: number;\n  totalRequiredDaily?: number;'
);

code = code.replace(
  /totalRequiredMonth: 88,/g,
  'totalRequiredMonth: 88,\n    totalRequiredDaily: 3,'
);
code = code.replace(
  /totalRequiredMonth: 22,/g,
  'totalRequiredMonth: 22,\n    totalRequiredDaily: 1,'
);
code = code.replace(
  /totalRequiredMonth: 40,/g,
  'totalRequiredMonth: 40,\n    totalRequiredDaily: 1,'
);
code = code.replace(
  /totalRequiredMonth: 31,/g,
  'totalRequiredMonth: 31,\n    totalRequiredDaily: 1,'
);
code = code.replace(
  /totalRequiredMonth: 62,/g,
  'totalRequiredMonth: 62,\n    totalRequiredDaily: 2,'
);
code = code.replace(
  /totalRequiredMonth: 93,/g,
  'totalRequiredMonth: 93,\n    totalRequiredDaily: 3,'
);
code = code.replace(
  /totalRequiredMonth: 7,/g,
  'totalRequiredMonth: 7,\n    totalRequiredDaily: 1,'
);

fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', code);
