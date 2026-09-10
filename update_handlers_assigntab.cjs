const fs = require('fs');
const file = 'src/components/AssignLeaveTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  const handleF295Toggle = (checked: boolean) => {
    setIncludeF295(checked);
    let currentCustom = f295CustomDays;
    if (checked && f295Option === 'custom' && f295CustomDays === 0) {
      currentCustom = 1;
      setF295CustomDays(1);
    }
    
    // If a preset is active, update the To Date based on it
    if (selectedPresetDays !== null) {
      updateToDateWithBase(selectedPresetDays, getF295Days(checked, f295Option, currentCustom));
    } else if (isCustomPresetActive) {
      updateToDateWithBase(customLeaveDays, getF295Days(checked, f295Option, currentCustom));
    }
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal?: number) => {
    setF295Option(opt);
    let currentCustom = f295CustomDays;
    if (opt === 'custom') {
      currentCustom = customVal ?? Math.max(1, f295CustomDays);
      setF295CustomDays(currentCustom);
    }
    
    // If a preset is active, update the To Date based on it
    if (selectedPresetDays !== null) {
      updateToDateWithBase(selectedPresetDays, getF295Days(includeF295, opt, currentCustom));
    } else if (isCustomPresetActive) {
      updateToDateWithBase(customLeaveDays, getF295Days(includeF295, opt, currentCustom));
    }
  };`;

const replaceCode = `  const handleF295Toggle = (checked: boolean) => {
    setIncludeF295(checked);
    let currentCustom = f295CustomDays;
    if (checked && f295Option === 'custom' && f295CustomDays === 0) {
      currentCustom = 1;
      setF295CustomDays(1);
    }
    
    if (selectedPresetDays !== null) {
      updateToDateWithBase(selectedPresetDays, getF295Days(checked, f295Option, currentCustom));
    } else if (isCustomPresetActive) {
      updateToDateWithBase(customLeaveDays, getF295Days(checked, f295Option, currentCustom));
    } else {
      const oldF295 = getF295Days(includeF295, f295Option, f295CustomDays);
      const base = Math.max(1, leaveDurationDays - oldF295);
      updateToDateWithBase(base, getF295Days(checked, f295Option, currentCustom));
    }
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal?: number) => {
    setF295Option(opt);
    let currentCustom = f295CustomDays;
    if (opt === 'custom') {
      currentCustom = customVal ?? Math.max(1, f295CustomDays);
      setF295CustomDays(currentCustom);
    }
    
    if (selectedPresetDays !== null) {
      updateToDateWithBase(selectedPresetDays, getF295Days(includeF295, opt, currentCustom));
    } else if (isCustomPresetActive) {
      updateToDateWithBase(customLeaveDays, getF295Days(includeF295, opt, currentCustom));
    } else {
      const oldF295 = getF295Days(includeF295, f295Option, f295CustomDays);
      const base = Math.max(1, leaveDurationDays - oldF295);
      updateToDateWithBase(base, getF295Days(includeF295, opt, currentCustom));
    }
  };`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched handlers in AssignLeaveTab!");
