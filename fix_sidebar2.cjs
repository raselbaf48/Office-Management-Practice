const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const registerBtn = code.substring(code.indexOf('{/* Monthly Duty Register */}'), code.indexOf('{/* Duty Ratio (BAF 155 Scale) */}'));
const ratioBtn = code.substring(code.indexOf('{/* Duty Ratio (BAF 155 Scale) */}'), code.indexOf('{/* Duty Analytics & Working Hours */}'));

// Remove from old place
code = code.replace(registerBtn, '');
code = code.replace(ratioBtn, '');

// Add to new place (under TDY Register)
const tdyEnd = code.indexOf('</button>', code.indexOf('{/* TDY Register */}')) + 9;
code = code.substring(0, tdyEnd) + '\n' + registerBtn + ratioBtn + code.substring(tdyEnd);

// For Duty Analysis and Duty Conflicts -> Independent section
const analysisBtn = code.substring(code.indexOf('{/* Duty Analytics & Working Hours */}'), code.indexOf('{/* Duty Conflicts */}'));
const conflictBtn = code.substring(code.indexOf('{/* Duty Conflicts */}'), code.indexOf('</>', code.indexOf('{/* Duty Conflicts */}')));

code = code.replace(analysisBtn, '');
code = code.replace(conflictBtn, '');

// Place them after Section 4
const section4End = code.indexOf('</div>', code.indexOf('</button>', code.indexOf('{/* Duty Roster Period (Visible to all) */}')) + 9);
const independentSection = `
          {/* SECTION 5: ANALYSIS & CONFLICTS */}
          <div>
            {!collapsed && (
              <div className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-200/50 mt-4">
                <span>ANALYSIS</span>
              </div>
            )}
            <div className="mt-1 space-y-1">
              ${analysisBtn}
              ${conflictBtn}
            </div>
          </div>
`;
code = code.substring(0, section4End + 6) + independentSection + code.substring(section4End + 6);

fs.writeFileSync('src/components/Sidebar.tsx', code);
