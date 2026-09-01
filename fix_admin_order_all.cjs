const fs = require('fs');

const files = [
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/services/localDatabase.ts',
  'src/data/dutyTypes.ts',
  'src/types.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/Drill Cat-C/g, 'Admin Order');
    content = content.replace(/Drill cat-c/ig, 'Admin Order');
    content = content.replace(/DRILL_CAT_C/g, 'ADMIN_ORDER');
    content = content.replace(/drillCatCList/g, 'adminOrderList');
    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log("Fixed all references");
