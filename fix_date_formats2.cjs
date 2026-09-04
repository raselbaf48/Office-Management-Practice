const fs = require('fs');
const filesToProcess = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

filesToProcess.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    let original = file;
    
    // Some uses formatting function formatDateShort and formatDateSuperShort, let's fix those
    // const formatDateShort = (dStr: string) => { const d = new Date(dStr); return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }); };
    
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: 'numeric'");
    file = file.replace(/year:\s*undefined/g, "year: 'numeric'");
    
    // Oh wait, the prompt asks: 
    // "dt fomat Changr hbe, 04 Sep hbe sudhu, abr jekhane year ase oikhane dd mm yyyy format a hbe"
    // So 04 Sep 26 -> 04 Sep
    // And if there's a year, make it 4 digit: 04 Sep 2026

    fs.writeFileSync(filePath, file);
  }
});
