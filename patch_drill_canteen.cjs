const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');

    // Replace table header
    content = content.replace(
      />\s*Drill Cat-C\s*<\/div>/g,
      ">Canteen</div>"
    );
    content = content.replace(
      /rowSpan=\{2\}>Drill Cat-C<\/th>/g,
      "rowSpan={2}>Canteen</th>"
    );

    // Replace table data (totals) - we need to find where drillCatCList.length is rendered.
    // Usually it looks like `{fltData.drillCatC.length || ''}` or something similar?
    // Let's check how the data row is structured first before blindly replacing.
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Patched header in ${file}`);
  }
});
