const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  '        />\n      )}\n    </div>\n  );\n};',
  '        />\n      )}\n      </div>\n    </div>\n    </div>\n  );\n};'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
