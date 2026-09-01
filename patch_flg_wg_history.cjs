const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add historical custom categories state
code = code.replace(
  "const [customColumns, setCustomColumns] = useState<string[]>([]);",
  "const [customColumns, setCustomColumns] = useState<string[]>([]);\n  const [historicalCustomCats, setHistoricalCustomCats] = useState<string[]>(() => { try { const saved = localStorage.getItem('flg_wg_historical_custom'); return saved ? JSON.parse(saved) : []; } catch { return []; } });"
);

// 2. Add to historical when adding a custom category
code = code.replace(
  "const handleAddDisposalToForm = (name: string) => {",
  `const handleAddDisposalToForm = (name: string) => {
    if (!ALL_DISPOSAL_OPTIONS.includes(name) && !historicalCustomCats.includes(name)) {
      const newHistory = [...historicalCustomCats, name];
      setHistoricalCustomCats(newHistory);
      localStorage.setItem('flg_wg_historical_custom', JSON.stringify(newHistory));
    }`
);

// 3. Update dropdown render to include history
code = code.replace(
  "{ALL_DISPOSAL_OPTIONS.filter(opt => !formSavedDisposals.includes(opt)).map((opt) => (",
  "{Array.from(new Set([...ALL_DISPOSAL_OPTIONS, ...historicalCustomCats, ...customColumns])).filter(opt => !formSavedDisposals.includes(opt)).map((opt) => ("
);

fs.writeFileSync(path, code);
