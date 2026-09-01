const fs = require('fs');

let attCode = fs.readFileSync('src/components/AttachmentRegisterView.tsx', 'utf-8');
attCode = attCode.replace(
/<div className="space-y-2 max-h-\[160px\] overflow-y-auto bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">[\s\S]*?<\/label>\s*\}\)\}\s*<\/div>/,
`<select
  value={attAirmanId}
  onChange={(e) => setAttAirmanId(e.target.value)}
  className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!attAirmanId ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}
  required
>
  <option value="" disabled={false}>— Select an Airman —</option>
  {grantAirmenList.map((a) => (
    <option key={a.id} value={a.id}>{a.rank} {a.name}</option>
  ))}
</select>`
);
fs.writeFileSync('src/components/AttachmentRegisterView.tsx', attCode, 'utf-8');

let tdyCode = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf-8');
tdyCode = tdyCode.replace(
/<div className="space-y-2 max-h-\[160px\] overflow-y-auto bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">[\s\S]*?<\/label>\s*\}\)\}\s*<\/div>/,
`<select
  value={tdyAirmanId}
  onChange={(e) => setTdyAirmanId(e.target.value)}
  className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!tdyAirmanId ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}
  required
>
  <option value="" disabled={false}>— Select an Airman —</option>
  {grantAirmenList.map((a) => (
    <option key={a.id} value={a.id}>{a.rank} {a.name}</option>
  ))}
</select>`
);
fs.writeFileSync('src/components/TdyRegisterView.tsx', tdyCode, 'utf-8');
console.log('Fixed arrays mapping');
