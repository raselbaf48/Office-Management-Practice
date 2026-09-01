const fs = require('fs');
const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx'];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    // Replace "Admin Order" header with "Drill Cat-C"
    content = content.replace(/>\s*Admin Order\s*<\/div>/g, ">Drill Cat-C</div>");
    // Also replace stats.adminCommCount in the td
    content = content.replace(/stats\.adminCommCount/g, "stats.drillCatCCount");
    
    // For Night Count table
    content = content.replace(/rowSpan=\{2\}>Admin Order<\/th>/, "rowSpan={2}>Drill Cat-C</th>");
    content = content.replace(/Admin Order\/<br \/>Comm/g, "Drill Cat-C");
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Patched Admin Order -> Drill Cat-C in', file);
  }
});
