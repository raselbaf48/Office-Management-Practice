const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// Find the start of the modal
const startIndex = file.indexOf('{/* Duty Targets Settings Modal */}');
// Find the end of the return statement
const endIndex = file.lastIndexOf(')');

if(startIndex > -1 && endIndex > -1) {
    const importStr = "import { DutyRatioSettingsModal } from './DutyRatioSettingsModal';\n";
    if(!file.includes("import { DutyRatioSettingsModal }")) {
        file = file.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + importStr);
    }
    
    // We need to carefully find the end of the modal.
    // Let's replace by chunk.
    const oldModalText = file.substring(startIndex, endIndex);
    const splitIndex = oldModalText.indexOf('</button>');
    // The previous modal ends with:
    //             </div>
    //           </div>
    //         </div>
    //       )}
    
    // A safer way is regex.
    const newFile = file.replace(/\{\/\* Duty Targets Settings Modal \*\/\}[\s\S]*\}\)}/, 
      `{/* Duty Targets Settings Modal */}
      {isSettingsOpen && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <DutyRatioSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};`);
    
    fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', newFile, 'utf-8');
    console.log("Patched successfully");
} else {
    console.log("Could not find injection point");
}
