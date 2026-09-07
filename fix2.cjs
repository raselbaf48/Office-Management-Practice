const fs = require('fs');
let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Actions \*\/}\s*<div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">/,
`                      </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">`
);

fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
