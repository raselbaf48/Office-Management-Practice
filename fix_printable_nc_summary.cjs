const fs = require('fs');

const file = 'src/components/PrintableNightCountModal.tsx';
if(fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');

  // The block we are replacing in the summary totals section
  const replaceSummaryRegex = /else if \(isBake \|\| isIdacB \|\| isIdacC \|\| codeUpper === 'OFFICE' \|\| notesLower\.includes\('office'\)\) \{[\s\S]*?\} else if \(\['GD'/;

  const newSummaryBlock = `else if (isBake || codeUpper === 'CANTEEN' || notesLower.includes('canteen') || codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
          // Available on Parade / PT
        } else if (isIdacB || isIdacC || codeUpper === 'OFFICE' || notesLower.includes('office')) {
          officeDutyCount++;
          totalOutPt++;
        } else if (['GD'`;

  if (content.match(replaceSummaryRegex)) {
    content = content.replace(replaceSummaryRegex, newSummaryBlock);
  }

  // Ensure the IDAC/Duty Off check matches exactly what we have on line 710
  const oldParadeCheck = /if \(codeUpper === 'ON_PARADE' \|\| statusCategory === 'PARADE' \|\| isNightCountIdacA \|\| isDutyOff\) \{/;
  const newParadeCheck = `if (codeUpper === 'ON_PARADE' || statusCategory === 'PARADE' || isNightCountIdacA || isDutyOff) {`;
  content = content.replace(oldParadeCheck, newParadeCheck);


  fs.writeFileSync(file, content, 'utf-8');
  console.log("Printable Night Count Summary updated");
}
