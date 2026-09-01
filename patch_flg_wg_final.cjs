const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix handleRemoveDisposalFromForm to save to history
code = code.replace(
  "const handleRemoveDisposalFromForm = (name: string) => {\n    const updated = formSavedDisposals.filter(d => d !== name);",
  "const handleRemoveDisposalFromForm = (name: string) => {\n    if (!ALL_DISPOSAL_OPTIONS.includes(name) && !historicalCustomCats.includes(name)) {\n      const newHistory = [...historicalCustomCats, name];\n      setHistoricalCustomCats(newHistory);\n      localStorage.setItem('flg_wg_historical_custom', JSON.stringify(newHistory));\n    }\n    const updated = formSavedDisposals.filter(d => d !== name);"
);

// Fix default formSavedDisposals to include all standard columns if not present in localStorage
code = code.replace(
  "return saved ? JSON.parse(saved).map(s => s === 'Total Strength' ? 'Total Str' : (s === 'Det/Tdy' ? 'Det/Tdy' : s)) : ['Total Str'];",
  "return saved ? JSON.parse(saved).map(s => s === 'Total Strength' ? 'Total Str' : (s === 'Det/Tdy' ? 'Det/Tdy' : s)) : [...ALL_DISPOSAL_OPTIONS];"
);
code = code.replace(
  "} catch { return ['Total Str']; }",
  "} catch { return [...ALL_DISPOSAL_OPTIONS]; }"
);

fs.writeFileSync(path, code);
