const fs = require('fs');
const file = 'src/components/AssignLeaveTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `  const handlePresetToggle = (days: number) => {
    if (selectedPresetDays === days) {
      setSelectedPresetDays(null);
      setLeaveToDate(leaveFromDate);
    } else {
      setSelectedPresetDays(days);
      setIsCustomPresetActive(false);
      if (leaveFromDate) {
        const d = new Date(leaveFromDate);
        d.setDate(d.getDate() + days - 1);
        setLeaveToDate(d.toISOString().split('T')[0]);
      }
    }
  };

  const handleCustomLeaveDaysChange = (days: number) => {
    setCustomLeaveDays(days);
    if (leaveFromDate) {
      const d = new Date(leaveFromDate);
      d.setDate(d.getDate() + days - 1);
      setLeaveToDate(d.toISOString().split('T')[0]);
      setSelectedPresetDays(null);
      setIsCustomPresetActive(true);
    }
  };

  const handleF295Toggle = (checked: boolean) => {
    setIncludeF295(checked);
    if (checked && f295Option === 'custom' && f295CustomDays === 0) setF295CustomDays(1);
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal?: number) => {
    setF295Option(opt);
    if (opt === 'custom') setF295CustomDays(customVal ?? Math.max(1, f295CustomDays));
  };`;

const replCode = `  const getF295Days = (checked: boolean, opt: string, customVal: number) => {
    return checked ? (opt === '2' ? 2 : opt === '3' ? 3 : customVal) : 0;
  };

  const updateToDateWithBase = (baseDays: number, f295Days: number) => {
    if (leaveFromDate) {
      const d = new Date(leaveFromDate);
      d.setDate(d.getDate() + baseDays + f295Days - 1);
      setLeaveToDate(d.toISOString().split('T')[0]);
    }
  };

  const handlePresetToggle = (days: number) => {
    if (selectedPresetDays === days) {
      setSelectedPresetDays(null);
      setLeaveToDate(leaveFromDate);
    } else {
      setSelectedPresetDays(days);
      setIsCustomPresetActive(false);
      updateToDateWithBase(days, getF295Days(includeF295, f295Option, f295CustomDays));
    }
  };

  const handleCustomLeaveDaysChange = (days: number) => {
    setCustomLeaveDays(days);
    setSelectedPresetDays(null);
    setIsCustomPresetActive(true);
    updateToDateWithBase(days, getF295Days(includeF295, f295Option, f295CustomDays));
  };

  const handleF295Toggle = (checked: boolean) => {
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

content = content.replace(findCode, replCode);

// Also need to check onChange of leaveFromDate
const findFromDateCode = `                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  } else if (isCustomPresetActive) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + customLeaveDays - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  }`;
                  
const replFromDateCode = `                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    const extra = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
                    d.setDate(d.getDate() + selectedPresetDays + extra - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  } else if (isCustomPresetActive) {
                    const d = new Date(val);
                    const extra = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
                    d.setDate(d.getDate() + customLeaveDays + extra - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  }`;

content = content.replace(findFromDateCode, replFromDateCode);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched leave auto calc!");
