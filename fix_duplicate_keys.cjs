const fs = require('fs');
const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Fix drillCatCList check
  code = code.replace(/else if \(\['ADMIN_ORDER', 'CAT_C', 'DRILL'\]\.includes\(codeUpper\)/g, 
    "else if (['CAT_C', 'DRILL'].includes(codeUpper)");

  // Fix return blocks inside processImportedText / fallback parsing
  code = code.replace(/if \(\['ADMIN_ORDER', 'CAT_C', 'DRILL'\]\.includes\(codeUpper\)\) \{\s*return \{ isOnParade: false, label: "Admin Order", dutyCode: 'ADMIN_ORDER', notes, dutyName: "Admin Order" \};\s*\}/g,
    'if ([\'CAT_C\', \'DRILL\'].includes(codeUpper)) {\n                      return { isOnParade: false, label: "Drill Cat-C", dutyCode: \'CAT_C\', notes, dutyName: "Drill Cat-C" };\n                    }');
                    
  // Fix renderDisposalAirmenList(drillCatCList, 'ADMIN_ORDER', 'Drill Cat-C')
  code = code.replace(/renderDisposalAirmenList\(drillCatCList, 'ADMIN_ORDER', 'Drill Cat-C'\)/g, 
    "renderDisposalAirmenList(drillCatCList, 'CAT_C', 'Drill Cat-C')");

  fs.writeFileSync(file, code);
});
