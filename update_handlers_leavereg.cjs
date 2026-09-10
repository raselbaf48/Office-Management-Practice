const fs = require('fs');
const file = 'src/components/LeaveRegisterView.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  const handleF295Toggle = (enabled: boolean) => {
    setIncludeF295(enabled);
    if (selectedPresetDays !== null) {
      applyPresetDays(selectedPresetDays, enabled, f295Option, f295CustomDays);
    } else if (isCustomPresetActive) {
      applyPresetDays(customLeaveDays, enabled, f295Option, f295CustomDays);
    }
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal: number = f295CustomDays) => {
    setF295Option(opt);
    if (includeF295) {
      if (selectedPresetDays !== null) {
        applyPresetDays(selectedPresetDays, true, opt, customVal);
      } else if (isCustomPresetActive) {
        applyPresetDays(customLeaveDays, true, opt, customVal);
      }
    }
  };`;

const replaceCode = `  const handleF295Toggle = (enabled: boolean) => {
    setIncludeF295(enabled);
    if (selectedPresetDays !== null) {
      applyPresetDays(selectedPresetDays, enabled, f295Option, f295CustomDays);
    } else if (isCustomPresetActive) {
      applyPresetDays(customLeaveDays, enabled, f295Option, f295CustomDays);
    } else {
      const oldF295 = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
      const base = Math.max(1, (modalDaysCalc?.totalCalendarDays || 1) - oldF295);
      applyPresetDays(base, enabled, f295Option, f295CustomDays);
    }
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal: number = f295CustomDays) => {
    setF295Option(opt);
    if (includeF295) {
      if (selectedPresetDays !== null) {
        applyPresetDays(selectedPresetDays, true, opt, customVal);
      } else if (isCustomPresetActive) {
        applyPresetDays(customLeaveDays, true, opt, customVal);
      } else {
        const oldF295 = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
        const base = Math.max(1, (modalDaysCalc?.totalCalendarDays || 1) - oldF295);
        applyPresetDays(base, true, opt, customVal);
      }
    }
  };`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched handlers in LeaveRegisterView!");
