const fs = require('fs');

function fix(file, type) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('const [summaryFilter')) {
    code = code.replace(
      "const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));",
      "const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));\n  const [summaryFilter, setSummaryFilter] = useState<" + type + " | null>(null);"
    );
    fs.writeFileSync(file, code);
  }
}

fix('src/components/LeaveRegisterView.tsx', "'Casual' | 'Annual' | 'Recreation' | 'Total' | 'OnLeave'");
fix('src/components/TdyRegisterView.tsx', "'OnTdy' | 'TotalTdy' | 'Available'");
fix('src/components/DeploymentRegisterView.tsx', "'OnAtt' | 'TotalAtt' | 'Available'");
