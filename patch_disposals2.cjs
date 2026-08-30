const fs = require('fs');
let file = 'src/components/ParadeStateFormattedView.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // We need to replace the two places where the options are defined.
  // One is for Add Disposal:
  // {[ ... ]}.map((cat) => {
  //   const isSelected = disposalCategory === cat.code;
  
  // The other is for Edit Disposal:
  // {[ ... ]}.map((cat) => {
  //   const isSelected = editDisposalCategory === cat.code;

  content = content.replace(
    /\{\[([\s\S]*?)\]\}\.map\(\(cat\) => \{\s*const isSelected = disposalCategory === cat\.code;/g,
    `{[
                    { code: 'ESSN', label: 'ESSN (Essential)' },
                    { code: 'SICK_REPORT', label: 'Sick Report' },
                    { code: 'DRILL_CAT_C', label: "Drill Cat 'C'" },
                    { code: 'OTHERS', label: '✨ Other Custom' },
                  ]}.map((cat) => {
                    const isSelected = disposalCategory === cat.code;`
  );

  content = content.replace(
    /\{\[([\s\S]*?)\]\}\.map\(\(cat\) => \{\s*const isSelected = editDisposalCategory === cat\.code;/g,
    `{[
                    { code: 'ON_PARADE', label: '✅ On Parade (Clear)' },
                    { code: 'ESSN', label: 'ESSN (Essential)' },
                    { code: 'SICK_REPORT', label: 'Sick Report' },
                    { code: 'DRILL_CAT_C', label: "Drill Cat 'C'" },
                    { code: 'OTHERS', label: '✨ Other Custom' },
                  ]}.map((cat) => {
                    const isSelected = editDisposalCategory === cat.code;`
  );

  fs.writeFileSync(file, content);
}
