const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove from Countdown
content = content.replace(/    const handleDeleteHistoryItem = \(item: any\) => \{\n    const updated = appConfigHistory\.filter\(h => h\.id !== item\.id\);\n    setAppConfigHistory\(updated\);\n    \/\/ Ideally update authSession here if you persist it\n  \};\n/, '');

// Find the SettingsModal return
const targetReturn = "  return (\n    <div className=";
const replacementReturn = `  const handleDeleteHistoryItem = (item: any) => {
    const updated = appConfigHistory.filter(h => h.id !== item.id);
    setAppConfigHistory(updated);
  };

  return (
    <div className="`;

if (content.includes(targetReturn)) {
  content = content.replace(targetReturn, replacementReturn);
}

fs.writeFileSync(file, content);
