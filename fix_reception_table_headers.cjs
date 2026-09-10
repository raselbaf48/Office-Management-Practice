const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace single-day table header
  content = content.replace(
    /<div className="w-full h-28 flex items-center justify-center \[writing-mode:vertical-lr\] \[transform:rotate\(180deg\)\] text-\[9px\]">K\/O & Reception<\/div>/g,
    '<div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">{isPtDocument ? "Reception Duty" : "K/O & Reception"}</div>'
  );
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched single-day Reception table headers");
