const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// I will just trim anything after `      />\n    </div>\n    </div>\n    </div>\n  );\n};` to fix it.
// Oh wait, `PrintableParadeStateModal` is a clone of `ParadeStateFormattedView` and it still has the internal print modal call.
// Let's replace the bottom to what it should be.
