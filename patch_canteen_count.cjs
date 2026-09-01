const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');

    // Rename variable usages for the table
    // 1. Add canteenCount
    content = content.replace(
      /let drillCatCCount = 0;/,
      "let canteenCount = 0;\n      let drillCatCCount = 0;"
    );

    // 2. Increment canteenCount
    content = content.replace(
      /else if \(dutyCode === 'DRILL_CAT_C'\) \{[\s\n]*drillCatCCount\+\+;[\s\n]*\}/,
      "else if (dutyCode === 'CANTEEN') {\n            canteenCount++;\n          } else if (dutyCode === 'DRILL_CAT_C') {\n            drillCatCCount++;\n          }"
    );

    // 3. Return canteenCount in stats object
    content = content.replace(
      /drillCatCCount,/g,
      "canteenCount,\n        drillCatCCount,"
    );

    // 4. Update the table column for Canteen to use stats.canteenCount instead of stats.drillCatCCount
    // Actually, I can just replace `stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'` with `stats.canteenCount > 0 ? stats.canteenCount : '-'` in the JSX if it exists
    content = content.replace(
      /stats\.drillCatCCount > 0 \? stats\.drillCatCCount : '-'/g,
      "stats.canteenCount > 0 ? stats.canteenCount : '-'"
    );

    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Patched canteen count in ${file}`);
  }
});
