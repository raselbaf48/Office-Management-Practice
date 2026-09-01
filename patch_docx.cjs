const fs = require('fs');
let code = fs.readFileSync('src/utils/docxExport.ts', 'utf8');

// Replace statHeaders in docxExport.ts
const headerTarget = `  const statHeaders = [
    'Unit',
    'Total\\nstr',
    'Eff\\nstr',
    'Leave',
    'Essn',
    'CMH/BNS/BSH',
    'Sick\\nReport',
    'Drill\\nCat-C',
    'Guard Duty\\nOn/Off',
    'Canteen',
    'Bake &\\nBite',
    'K/O &\\nReception',
    'Guard of\\nHonour',
    isPt ? 'Total Out\\nPT' : 'Total Out\\nParade',
    isPt ? 'On PT' : 'On Parade',
    'Rmk',
  ];`;

const headerReplace = `  const statHeaders = [
    'Unit',
    'Total\\nstr',
    'Det/\\nTdy',
    'Eff\\nstr',
    'Leave',
    'Essn',
    'CMH/BNS/BSH',
    'Sick\\nReport',
    'Drill\\nCat-C',
    'Guard Duty\\nOn/Off',
    'Canteen',
    'Bake &\\nBite',
    'K/O &\\nReception',
    'Guard of\\nHonour',
    isPt ? 'Total Out\\nPT' : 'Total Out\\nParade',
    isPt ? 'On PT' : 'On Parade',
    'Rmk',
  ];`;

code = code.replace(headerTarget, headerReplace);

const dataRowTarget = `  const dataRow = new TableRow({
    children: [
      createArialDataCell('155 UASU BAF', 1500, AlignmentType.CENTER),
      createArialDataCell(String(stats.totalStr), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.detTdyCount), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.effStr), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.leaveCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.essnCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.hospitalCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.sickExCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.drillCatCCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.guardDutyCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.bakeBiteCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.koReceptionCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.adminCommCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.classTrgCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.airFdDutyCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.gamesCount), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.totalOutPt), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.onPtParadeCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.absentCount), 680, AlignmentType.CENTER),
      createArialDataCell('-', 680, AlignmentType.CENTER),
    ],
  });`;

const dataRowReplace = `  const dataRow = new TableRow({
    children: [
      createArialDataCell('155 UASU BAF', 1500, AlignmentType.CENTER),
      createArialDataCell(String(stats.totalStr), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.detTdyCount), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.effStr), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.leaveCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.essnCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.hospitalCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.sickExCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.drillCatCCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.guardDutyCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.canteenCount || 0), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.bakeBiteCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.koReceptionCount), 680, AlignmentType.CENTER),
      createArialDataCell(valOrDash(stats.gamesCount), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.totalOutPt), 680, AlignmentType.CENTER),
      createArialDataCell(String(stats.onPtParadeCount), 680, AlignmentType.CENTER),
      createArialDataCell('-', 680, AlignmentType.CENTER),
    ],
  });`;

code = code.replace(dataRowTarget, dataRowReplace);
fs.writeFileSync('src/utils/docxExport.ts', code);
console.log('Patched docxExport.ts');
