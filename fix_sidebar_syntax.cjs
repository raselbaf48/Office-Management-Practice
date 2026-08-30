const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\{\/\* Admin only items \*\/}[\s\S]*?\{\/\* SECTION 5/m;
code = code.replace(regex, `{/* Admin only items */}
                    {role === 'ADMIN' && (
                      <></>
                    )}
                  </div>
                )}
              </div>
          {/* SECTION 5`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
