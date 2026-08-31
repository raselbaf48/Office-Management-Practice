const fs = require('fs');
let file = fs.readFileSync('src/components/FlgWgHistoryModal.tsx', 'utf-8');

file = file.replace(
`  const handleRemove = (log: any) => {
    if (!log.raw) {
      if (window.confirm('This is an older log without specific quantity data. Removing it will ONLY delete this history record but will NOT automatically adjust the Flying Wing count. Proceed?')) {
        deleteLogEntry(log);
      }
      return;
    }

    if (window.confirm(\`Are you sure you want to remove this disposal for \${log.unit}? This will subtract the counts from the unit's total.\`)) {
      // 1. Revert the data
      adjustUnitData(log.dateStr, log.unit, log.raw, true);
      // 2. Delete the log
      deleteLogEntry(log);
    }
  };`,
`  const handleRemove = (log: any) => {
    if (!log.raw) {
      deleteLogEntry(log);
      return;
    }
    // 1. Revert the data
    adjustUnitData(log.dateStr, log.unit, log.raw, true);
    // 2. Delete the log
    deleteLogEntry(log);
  };`
);

file = file.replace(
`  const startEdit = (log: any) => {
    if (!log.raw) {
      alert('This older log cannot be edited because it lacks detailed quantity data. You can only remove it.');
      return;
    }
    setEditingLogId(log.id);
    setEditForm({ ...log.raw });
  };`,
`  const startEdit = (log: any) => {
    if (!log.raw) {
      // Ignore if cannot be edited
      return;
    }
    setEditingLogId(log.id);
    setEditForm({ ...log.raw });
  };`
);

fs.writeFileSync('src/components/FlgWgHistoryModal.tsx', file, 'utf-8');
