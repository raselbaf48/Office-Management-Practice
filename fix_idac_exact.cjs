const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const target = `                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Footer */}`;

const replacement = `                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}`;

code = code.replace(target, replacement);

// And we still need to apply:
code = code.replace(
  /useState\<'CONTACTS' \| 'SHIFT_TIMES' \| 'RESPONSIBILITIES'\>\('CONTACTS'\);/,
  "useState<'CONTACTS' | 'SHIFT_TIMES' | 'RESPONSIBILITIES' | null>('CONTACTS');"
);

fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
