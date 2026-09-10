const fs = require('fs');
const file = 'src/components/LeaveRegisterView.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setLeaveFromDate(newFrom);
                      if (!leaveToDate || leaveToDate < newFrom) {
                        setLeaveToDate(newFrom);
                      }
                      if (selectedPresetDays !== null) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + selectedPresetDays - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      } else if (isCustomPresetActive) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + customLeaveDays - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      }
                    }}`;

const replaceCode = `                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setLeaveFromDate(newFrom);
                      if (!leaveToDate || leaveToDate < newFrom) {
                        setLeaveToDate(newFrom);
                      }
                      
                      const extra = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
                      if (selectedPresetDays !== null) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + selectedPresetDays + extra - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      } else if (isCustomPresetActive) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + customLeaveDays + extra - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      }
                    }}`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched DateNavigator onChange in LeaveRegisterView!");
