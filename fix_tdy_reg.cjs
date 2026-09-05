const fs = require('fs');

function fixTdyRegisterView() {
  let file = 'src/components/TdyRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Change selectedPresetDays !== 1
  code = code.replace(
    /\{selectedPresetDays !== 1 && \(/,
    `{selectedPresetDays !== 1 && selectedPresetDays !== -1 && (`
  );

  // Change onChange
  code = code.replace(
    /onChange=\{\(e\) => \{\s*setTdyFromDate\(e.target.value\);\s*if \(tdyToDate < e.target.value\) setTdyToDate\(e.target.value\);\s*\/\/ Keep To Date in sync if it's a single day selection\s*if \(selectedPresetDays === 1\) \{\s*setTdyToDate\(e.target.value\);\s*\} else if \(selectedPresetDays !== null\) \{\s*const d = new Date\(e.target.value\);\s*d.setDate\(d.getDate\(\) \+ selectedPresetDays - 1\);\s*setTdyToDate\(d.toISOString\(\).split\('T'\)\[0\]\);\s*\}\s*\}\}/,
    `onChange={(e) => {
                      const val = e.target.value;
                      setTdyFromDate(val);
                      
                      // Keep To Date in sync if it's a single day selection
                      if (selectedPresetDays === 1 || selectedPresetDays === -1) {
                          setTdyToDate(val);
                          const todayStr = new Date().toISOString().split('T')[0];
                          setSelectedPresetDays(val === todayStr ? 1 : -1);
                      } else if (selectedPresetDays !== null) {
                          const d = new Date(val);
                          d.setDate(d.getDate() + selectedPresetDays - 1);
                          setTdyToDate(d.toISOString().split('T')[0]);
                      } else {
                          if (tdyToDate < val) setTdyToDate(val);
                      }
                    }}`
  );

  fs.writeFileSync(file, code);
}
fixTdyRegisterView();
console.log('Fixed TdyRegisterView presets');
