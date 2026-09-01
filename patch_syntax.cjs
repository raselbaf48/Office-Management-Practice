const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target = `                  <table className="w-full min-w-[700px] print:min-w-0 text-center align-middle border-collapse border-2 border-slate-900 text-[11px]">
                    {Object.keys(customDisposalsMap).map(key => (
      <th key={key} className="border border-black p-0.5 align-middle text-center">
        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
          {key}
        </div>
      </th>
    ))}
    <thead>`;
    
const replace = `                  <table className="w-full min-w-[700px] print:min-w-0 text-center align-middle border-collapse border-2 border-slate-900 text-[11px]">
    <thead>`;

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
    console.log('Fixed syntax error inside table');
} else {
    console.log('Target not found inside table');
}
