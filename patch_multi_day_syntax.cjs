const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const target = `                {Object.keys(customDisposalsMap).map(key => (
      <th key={key} className="border border-black p-0.5 align-middle text-center">
        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
          {key}
        </div>
      </th>
    ))}
    <thead>`;
    
const replace = `              <thead>`;

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
    console.log('Fixed syntax error in ParadeStateFormattedView.tsx multi-day table');
} else {
    console.log('Target not found');
}
