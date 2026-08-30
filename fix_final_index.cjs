const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const i = code.indexOf(') : (\\n)}');
if (i > -1) {
    code = code.replace(') : (\\n)}', ')}');
}

const j = code.indexOf(') : ()}');
if (j > -1) {
    code = code.replace(') : ()}', ')}');
}

fs.writeFileSync('src/components/Sidebar.tsx', code);
