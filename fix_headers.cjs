const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find all <th ... style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Text</th>
  // and replace them with <th ...><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] leading-tight">Text</div></th>
  
  const regex = /<th([^>]+?)style=\{\{\s*writingMode:\s*'vertical-rl',\s*transform:\s*'rotate\(180deg\)'\s*\}\}>([\s\S]*?)<\/th>/g;
  
  content = content.replace(regex, (match, classAttr, innerText) => {
    // clean up classAttr (it usually has `align-middle font-bold text-center`)
    // we keep the classAttr but remove those since flex handles it, but let's just keep them to be safe
    return `<th${classAttr}><div className="w-full h-36 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] leading-tight">${innerText.trim()}</div></th>`;
  });
  
  fs.writeFileSync(file, content, 'utf-8');
}

fixFile('src/components/NightCountStateView.tsx');
// Note: PrintableNightCountModal already has the div wrapper (I saw it earlier!)
// Let's check PrintableNightCountModal just in case.

console.log("Fixed headers in NightCountStateView");
