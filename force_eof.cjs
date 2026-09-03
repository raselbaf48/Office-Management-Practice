const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  /      \}\)\n    <\/div>\n  \);\n\};\n?$/,
  '      )}\n      </div>\n    </div>\n    </div>\n  );\n};\n'
);

if (!code.includes('</div>\n    </div>\n    </div>\n  );\n};')) {
    code = code.replace(
        /      \}\)\n    <\/div>\n  \);\n\};.*/,
        '      )}\n      </div>\n    </div>\n    </div>\n  );\n};\n'
    );
}

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
