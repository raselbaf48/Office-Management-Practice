const fs = require('fs');

function fixAlign(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // FlyingWingStateView.tsx uses <th ...><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Text</div></th>
  content = content.replace(/<th className="([^"]*)"([^>]*)><div style=\{\{ writingMode: 'vertical-rl', transform: 'rotate\(180deg\)' \}\} className="([^"]*)">([^<]*)<\/div><\/th>/g, 
    (match, thClasses, thAttrs, divClasses, text) => {
      let thCls = thClasses.split(' ');
      if (!thCls.includes('align-middle')) thCls.push('align-middle');
      if (!thCls.includes('text-center')) thCls.push('text-center');
      
      // Let's use the same approach as ParadeStateFormattedView
      return `<th className="${thCls.join(' ')}"${thAttrs}><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">${text}</div></th>`;
    }
  );

  // PrintableNightCountModal.tsx uses <th className="..." style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Text</th>
  content = content.replace(/<th className="([^"]*)" style=\{\{ writingMode: 'vertical-rl', transform: 'rotate\(180deg\)' \}\}>([^<]*)<\/th>/g, 
    (match, thClasses, text) => {
      let thCls = thClasses.split(' ');
      if (!thCls.includes('align-middle')) thCls.push('align-middle');
      if (!thCls.includes('text-center')) thCls.push('text-center');
      if (!thCls.includes('p-0.5')) thCls.push('p-0.5'); // remove p-2 if present to save space? Let's leave it.
      
      return `<th className="${thCls.join(' ')}"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">${text}</div></th>`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Fixed align in', filePath);
}

fixAlign('src/components/FlyingWingStateView.tsx');
fixAlign('src/components/PrintableNightCountModal.tsx');

