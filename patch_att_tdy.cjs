const fs = require('fs');

let attCode = fs.readFileSync('src/components/AttachmentRegisterView.tsx', 'utf-8');
attCode = attCode.replace(/const \[attAirmanIds, setAttAirmanIds\] = useState<string\[\]>\(\[\]\);/, "const [attAirmanId, setAttAirmanId] = useState<string>('');");
attCode = attCode.replace(/if \(attAirmanIds\.length === 0\) \{/, "if (!attAirmanId) {");

// Change the mapping over attAirmanIds to just an array of one
attCode = attCode.replace(
/const promises = attAirmanIds\.map\(id =>[\s\S]*?\);[\s\S]*?await Promise\.all\(promises\);/,
`const dutyCodeToUse = finalDest === 'Canteen' ? 'CANTEEN' : finalDest.includes('Bake') ? 'BAKE_N_BITE' : 'ATT';
      await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: attAirmanId,
          dutyCode: dutyCodeToUse,
          fromDate: attFromDate,
          toDate: attToDate,
          notes: notes,
        }),
      });`
);

attCode = attCode.replace(/setAttSuccessMsg\(\`✅ Attachment granted to \$\{attAirmanIds\.length\} airmen \(\$\{attDurationDays\} days\)!\`\);/, "setAttSuccessMsg(`✅ Attachment granted to 1 airman (${attDurationDays} days)!`);");

// Replace the checkboxes with a select
attCode = attCode.replace(
/<div className="max-h-48 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2">[\s\S]*?<\/div>/,
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

attCode = attCode.replace(/<option value="Bake N Bite">Bake N Bite<\/option>/, `<option value="Bake N Bite">Bake N Bite</option>\n                  <option value="Canteen">Canteen</option>`);

// Fix setAttAirmanIds([]) usages
attCode = attCode.replace(/setAttAirmanIds\(\[\]\);/g, "setAttAirmanId('');");

fs.writeFileSync('src/components/AttachmentRegisterView.tsx', attCode, 'utf-8');

let tdyCode = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf-8');
tdyCode = tdyCode.replace(/const \[tdyAirmanIds, setTdyAirmanIds\] = useState<string\[\]>\(\[\]\);/, "const [tdyAirmanId, setTdyAirmanId] = useState<string>('');");
tdyCode = tdyCode.replace(/if \(tdyAirmanIds\.length === 0\) \{/, "if (!tdyAirmanId) {");

tdyCode = tdyCode.replace(
/const promises = tdyAirmanIds\.map\(id =>[\s\S]*?\);[\s\S]*?await Promise\.all\(promises\);/,
`await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: tdyAirmanId,
          dutyCode: 'TDY',
          fromDate: tdyFromDate,
          toDate: tdyToDate,
          notes: notes,
        }),
      });`
);

tdyCode = tdyCode.replace(/setTdySuccessMsg\(\`✅ TDY granted to \$\{tdyAirmanIds\.length\} airmen \(\$\{tdyDurationDays\} days\)!\`\);/, "setTdySuccessMsg(`✅ TDY granted to 1 airman (${tdyDurationDays} days)!`);");

tdyCode = tdyCode.replace(
/<div className="max-h-48 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2">[\s\S]*?<\/div>/,
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

tdyCode = tdyCode.replace(/setTdyAirmanIds\(\[\]\);/g, "setTdyAirmanId('');");

fs.writeFileSync('src/components/TdyRegisterView.tsx', tdyCode, 'utf-8');

console.log('Patched Att and TDY register single select');
