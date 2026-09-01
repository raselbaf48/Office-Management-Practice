const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update ALL_DISPOSAL_OPTIONS
code = code.replace(
  "const ALL_DISPOSAL_OPTIONS = [\n  'Total Strength',\n  'Det/Tdy',\n  ...DISPOSAL_COLUMNS\n];",
  "const ALL_DISPOSAL_OPTIONS = [\n  'Total Str',\n  'Det/ Tdy',\n  ...DISPOSAL_COLUMNS\n];"
);

// Update localStorage migration for formSavedDisposals
code = code.replace(
  "return saved ? JSON.parse(saved) : ['Total Strength'];",
  "return saved ? JSON.parse(saved).map(s => s === 'Total Strength' ? 'Total Str' : (s === 'Det/Tdy' ? 'Det/ Tdy' : s)) : ['Total Str'];"
);
code = code.replace(
  "} catch { return ['Total Strength']; }",
  "} catch { return ['Total Str']; }"
);

// Update historical migration
code = code.replace(
  "return saved ? JSON.parse(saved) : []; } catch { return []; } });",
  "return saved ? JSON.parse(saved).map(s => s === 'Total Strength' ? 'Total Str' : (s === 'Det/Tdy' ? 'Det/ Tdy' : s)) : []; } catch { return []; } });"
);

// Update handleAddSubmit
code = code.replace(
  "if (k === 'Total Strength') newTotalStr = val;",
  "if (k === 'Total Str' || k === 'Total Strength') newTotalStr = val;"
);
code = code.replace(
  "else if (k === 'Det/Tdy') newDetTdy = val;",
  "else if (k === 'Det/ Tdy' || k === 'Det/Tdy') newDetTdy = val;"
);

// Update initial values
code = code.replace(
  "vals['Total Strength'] = existing.totalStr || 0;",
  "vals['Total Str'] = existing.totalStr || 0;"
);
code = code.replace(
  "vals['Det/Tdy'] = existing.detTdy || 0;",
  "vals['Det/ Tdy'] = existing.detTdy || 0;"
);

fs.writeFileSync(path, code);
console.log("Patched Flg Wg Names");
