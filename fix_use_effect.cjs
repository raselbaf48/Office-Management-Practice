const fs = require('fs');
const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableParadeStateModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const regex = /useEffect\(\(\) => \{\s+if \(!showAddDisposalModal \|\| !disposalFromDate\) return;\s+fetch\(`\/api\/parade-state\?date=\$\{disposalFromDate\}&shift=Morning`\)\s+\.then\(\(r\) => r\.json\(\)\)\s+\.then\(\(data.*?\) => \{\s+const map.*? = \{\};\s+\(data\?\.personnelStatusList \|\| \[\]\)\.forEach\(\(item\) => \{\s+map\[item\.airman\.id\] = \{\s+statusCategory: item\.statusCategory,\s+dutyCode: item\.dutyCode,\s+notes: item\.notes,\s+dutyName: item\.dutyName,\s+\};\s+\}\);\s+setDisposalPersonnelStatusMap\(map\);\s+\}\)\s+\.catch\(\(err\) => console\.error\('Failed to fetch disposal personnel statuses:', err\)\);\s+\}, \[showAddDisposalModal, disposalFromDate\]\);/g;

  content = content.replace(regex, `useEffect(() => {
    const fetchStatuses = () => {
      if (!showAddDisposalModal || !disposalFromDate) return;
      fetch(\`/api/parade-state?date=\${disposalFromDate}&shift=Morning\`)
        .then((r) => r.json())
        .then((data) => {
          const map = {};
          (data?.personnelStatusList || []).forEach((item) => {
            map[item.airman.id] = {
              statusCategory: item.statusCategory,
              dutyCode: item.dutyCode,
              notes: item.notes,
              dutyName: item.dutyName,
            };
          });
          setDisposalPersonnelStatusMap(map);
        })
        .catch((err) => console.error('Failed to fetch disposal personnel statuses:', err));
    };

    fetchStatuses();
    window.addEventListener('baf_state_updated', fetchStatuses);
    return () => window.removeEventListener('baf_state_updated', fetchStatuses);
  }, [showAddDisposalModal, disposalFromDate]);`);

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Done");
