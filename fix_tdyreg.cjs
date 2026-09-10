const fs = require('fs');
const file = 'src/components/TdyRegisterView.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                    onChange={(e) => {
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
                    }}`;

const replaceCode = `                    onChange={(e) => {
                      const val = e.target.value;
                      setTdyFromDate(val);
                      
                      if (!tdyToDate || tdyToDate < val) {
                        setTdyToDate(val);
                      }

                      // Keep To Date in sync if it's a single day selection
                      if (selectedPresetDays === 1 || selectedPresetDays === -1) {
                          setTdyToDate(val);
                          const todayStr = new Date().toISOString().split('T')[0];
                          setSelectedPresetDays(val === todayStr ? 1 : -1);
                      } else if (selectedPresetDays !== null) {
                          const d = new Date(val);
                          d.setDate(d.getDate() + selectedPresetDays - 1);
                          setTdyToDate(d.toISOString().split('T')[0]);
                      }
                    }}`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched TdyRegisterView date sync!");
