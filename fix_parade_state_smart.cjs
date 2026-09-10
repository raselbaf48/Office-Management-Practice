const fs = require('fs');

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the exact CANTEEN else-if branch
  const match = content.match(/\} else if \([^\n]*'CANTEEN'[^\n]*\) \{\n\s*canteenList\.push[^\n]*;\n\s*\}/);
  if (match) {
    // We found the Canteen branch. Let's comment it out or change it.
    // Replace it with an empty branch if it's purely Canteen, so it doesn't fall through to OTHERS if it shouldn't.
    content = content.replace(match[0], `} else if (codeUpper === 'CANTEEN' && !notesLower?.includes('canteen') && statusCategory === 'CANTEEN') {
        // Handled independently`);
  }

  // Insert the independent check before the main if-else chain
  const chainStartMatch = content.match(/(if\s*\(\s*statusCategory\s*===\s*'PARADE'\s*\|\|[^\n]*\)\s*\{)/);
  if (chainStartMatch && !content.includes('const isCanteen =')) {
    content = content.replace(chainStartMatch[1], `const isCanteen = codeUpper === 'CANTEEN' || notesLower?.includes('canteen') || statusCategory === 'CANTEEN';
        if (isCanteen) {
          canteenList.push({ airman, note: 'Canteen' });
        }
        
        ${chainStartMatch[1]}`);
  }

  // Prevent CANTEEN from falling to custom OTHERS
  content = content.replace(/\.includes\(codeUpper\)\) \{/g, (match) => {
    if (match.includes("'ABSENT'")) {
      return match.replace("'ABSENT'", "'ABSENT', 'CANTEEN'");
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('src/components/ParadeStateFormattedView.tsx');
updateFile('src/components/PrintableParadeStateModal.tsx');
