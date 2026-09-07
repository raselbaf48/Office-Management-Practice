const fs = require('fs');
let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');

code = code.replace(/<div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">\s*<button\s*onClick={\(\) => startEditing\(item\)}/,
`<div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                      <>
                    <button
                      onClick={() => startEditing(item)}`
);

code = code.replace(/<\/button>\s*<\/div>\s*<\/div>\s*<div className="p-4 border-t border-slate-100/,
`                    </button>
                    </>
                    )}
                  </div>
                </div>
              </div>
          <div className="p-4 border-t border-slate-100`
);

fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
