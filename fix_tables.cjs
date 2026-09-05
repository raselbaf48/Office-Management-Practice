const fs = require('fs');

const files = [
  { path: 'src/components/LeaveRegisterView.tsx', category: 'LEAVE', colSpanOld: 13, colSpanNew: 12 },
  { path: 'src/components/TdyRegisterView.tsx', category: 'TDY', colSpanOld: 10, colSpanNew: 9 },
  { path: 'src/components/DeploymentRegisterView.tsx', category: 'ATT', colSpanOld: 10, colSpanNew: 9 }
];

files.forEach(f => {
  if (!fs.existsSync(f.path)) return;
  let code = fs.readFileSync(f.path, 'utf8');

  // 1. Remove <th>Actions</th>
  code = code.replace(/<th className="py-3 px-4 text-right">Actions<\/th>/g, '');

  // 2. Add onClick to <tr> and cursor-pointer
  const trRegex = /<tr\s+key=\{airman\.id\}\s+className="(.*?)"\s*>/g;
  code = code.replace(trRegex, (match, classNames) => {
    return `<tr
                      key={airman.id}
                      onClick={() => onViewProfile && onViewProfile(airman, { initialTab: 'history', initialCategory: '${f.category}', historyOnly: true })}
                      className="${classNames} cursor-pointer group"
                    >`;
  });

  // 3. Remove the "History" button <td>
  const tdButtonRegex = /<td className="py-3 px-4 text-right">\s*<button\s*onClick=\{[^\}]+\}\s*className="[^"]+"\s*>\s*<Eye className="w-3 h-3 text-slate-500" \/>\s*<span>History<\/span>\s*<\/button>\s*<\/td>/g;
  code = code.replace(tdButtonRegex, '');

  // 4. Remove the button wrapper inside the name column
  const nameBtnRegex = /<button\s*onClick=\{[^\}]+\}\s*className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline text-left cursor-pointer"\s*title="Click to view full duty & leave history"\s*>\s*\{airman\.name\}\s*<\/button>/g;
  code = code.replace(nameBtnRegex, `<span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{airman.name}</span>`);

  // 5. Update colSpan loading
  const colSpanRegex = new RegExp(`colSpan=\\{${f.colSpanOld}\\}`, 'g');
  code = code.replace(colSpanRegex, `colSpan={${f.colSpanNew}}`);

  fs.writeFileSync(f.path, code);
  console.log('Fixed', f.path);
});

