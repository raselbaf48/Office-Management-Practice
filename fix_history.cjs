const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
const historyStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const renderEnd = `
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

// It seems historyBlock ended with:
//               </div>
//             </div>
//           )}
// And then `renderEnd` adds another set of divs that causes the mismatch.
// Actually, `renderEnd` matches exactly the required divs for my layout:
// - `            </div>` (closes max-w-3xl)
// - `          </div>` (closes flex-1 scrollable area)
// - `        </div>` (closes Right Column)
// - `      </div>` (closes w-full max-w-6xl container)
// - `    </div>` (closes fixed inset-0 overlay)
// So we just need to ensure that the sections (like historyBlock) are well-formed internally.

let historyFixed = current.substring(0, current.lastIndexOf(renderEnd));
// wait, historyBlock had `            </div>          )}` which balances its own `{activeSection === ...}`.
// Let me just format the file with prettier to see the error.
