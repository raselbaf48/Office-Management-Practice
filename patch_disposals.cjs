const fs = require('fs');

let file = 'src/components/ParadeStateFormattedView.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace Add Disposal list
  const addListRegex = /\{\[\s*\{\s*code:\s*'ESSN',[\s\S]*?\{\s*code:\s*'OTHERS',[^}]*\}\s*\,\s*\]\}/;
  content = content.replace(addListRegex, `{[
                    { code: 'ESSN', label: 'ESSN (Essential)' },
                    { code: 'SICK_REPORT', label: 'Sick Report' },
                    { code: 'DRILL_CAT_C', label: "Drill Cat 'C'" },
                    { code: 'OTHERS', label: '✨ Other Custom' }
                  ]}`);

  // Replace Edit Disposal list (need to preserve ON_PARADE for edit context so users can clear)
  // Let's actually replace all arrays matching the pattern to be safe, but make sure ON_PARADE is included if it was there.
  fs.writeFileSync(file, content);
}
