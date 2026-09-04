const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// Replace in getEffectiveManpower
code = code.replace(
  "disp = 'Deployment (Bake & Bite)';",
  "disp = 'Bake & Bite';"
);
code = code.replace(
  "disp = 'Deployment (Canteen)';",
  "disp = 'Canteen';"
);

// Replace in render loop
code = code.replace(
  "defaultDisp = 'Deployment (Bake & Bite)';",
  "defaultDisp = 'Bake & Bite';"
);
code = code.replace(
  "defaultDisp = 'Deployment (Canteen)';",
  "defaultDisp = 'Canteen';"
);

// We also need to fix the migration logic and the datalist rendering
// Migration logic (around line 482)
code = code.replace(
  "if (currentVal === 'Deployment') {",
  "if (currentVal === 'Deployment' || currentVal === 'Deployment (Bake & Bite)' || currentVal === 'Deployment (Canteen)') {"
);
// getEffectiveManpower migration logic (around line 100)
code = code.replace(
  "if (disp === 'Deployment') {",
  "if (disp === 'Deployment' || disp === 'Deployment (Bake & Bite)' || disp === 'Deployment (Canteen)') {"
);


// Replace in datalist
code = code.replace(
  '<option value="Deployment (Bake & Bite)" />',
  '<option value="Bake & Bite" />'
);
code = code.replace(
  '<option value="Deployment (Canteen)" />',
  '<option value="Canteen" />'
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
