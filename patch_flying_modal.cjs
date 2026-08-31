const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// Current logic for openAddModal:
// const openAddModal = (unitName?: string) => {
//     const existing = displayData.find(d => d.unit === (unitName || 'Flg WG HQ'));
//     if (existing) {
//       setAddForm({ ...existing });
//     }
//     onOpenAddModal();
//   };

// We will change this to initialize with empty/zero values instead.
const oldOpenAddModal = `  const openAddModal = (unitName?: string) => {
    const existing = displayData.find(d => d.unit === (unitName || 'Flg WG HQ'));
    if (existing) {
      setAddForm({ ...existing });
    }
    onOpenAddModal();
  };`;

const newOpenAddModal = `  const openAddModal = (unitName?: string) => {
    // Requirements: always open with blank fields.
    setAddForm({
      unit: unitName || '',
      totalStr: 0,
      detTdy: 0,
      leave: 0,
      edExPpgf: 0,
      cmhBnsBsh: 0,
      officeDuty: 0,
      baseAirfieldDuty: 0,
      driving: 0
    });
    onOpenAddModal();
  };`;

file = file.replace(oldOpenAddModal, newOpenAddModal);
fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
