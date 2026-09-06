const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');
const lines = content.split('\n');

// Line numbers are 1-based, we'll insert before the specified line
const inserts = [
  { line: 372, text: '          </div>' },
  { line: 568, text: '                </div>\n              </div>' },
  { line: 678, text: '              </div>' },
  { line: 775, text: '          </div>' },
];

let offset = 0;
for (const ins of inserts) {
  const index = ins.line - 1 + offset;
  lines.splice(index, 0, ins.text);
  offset += ins.text.split('\n').length;
}

lines.push('      </div>'); // close flex-1
lines.push('    </div>'); // close root
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', lines.join('\n'));
