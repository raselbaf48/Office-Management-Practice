const fs = require('fs');
const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/\} Settings,\n\} from 'lucide-react';/, "  Settings,\n} from 'lucide-react';");
  fs.writeFileSync(f, content, 'utf-8');
});
