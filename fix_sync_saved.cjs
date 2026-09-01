const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `      if (existing) {
        vals['Det/Tdy'] = existing.detTdy || 0;
        Object.entries(existing.disposals).forEach(([k, v]) => {
          const val = v as number;
          vals[k] = val;
        });
      }
      setFormDisposalValues(vals);`;

const replacement = `      if (existing) {
        vals['Det/Tdy'] = existing.detTdy || 0;
        Object.entries(existing.disposals).forEach(([k, v]) => {
          const val = v as number;
          vals[k] = val;
        });
        
        // Also ensure any keys present in this unit's data are visible in the form
        setFormSavedDisposals(prev => {
          const newKeys = Object.keys(vals).filter(k => !prev.includes(k));
          if (newKeys.length > 0) {
            const updated = [...prev, ...newKeys];
            localStorage.setItem('flg_wg_saved_disposals', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
      setFormDisposalValues(vals);`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(path, code);
  console.log("Patched successfully");
} else {
  console.log("Target not found!");
}
