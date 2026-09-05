const fs = require('fs');

function fixAssignDuty() {
  let file = 'src/components/AssignDutyModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Modify updatePresetBasedOnDates
  code = code.replace(
    /if \(start === todayStr\) \{\s*setSelectedPresetDays\(1\);\s*\} else \{\s*setSelectedPresetDays\(null\);\s*\}/,
    `if (start === todayStr) {
        setSelectedPresetDays(1);
      } else {
        setSelectedPresetDays(-1); // -1 means 1 day span but not today
      }`
  );

  // Modify UI hide condition
  code = code.replace(
    /\{selectedPresetDays !== 1 && \(/,
    `{selectedPresetDays !== 1 && selectedPresetDays !== -1 && (`
  );

  // Modify handleShiftDate where it checks selectedPresetDays
  code = code.replace(
    /if \(selectedPresetDays !== null\) \{/,
    `if (selectedPresetDays !== null) {`
  );

  fs.writeFileSync(file, code);
}

function fixAssignTdy() {
  let file = 'src/components/AssignTdyTab.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Check if AssignTdyTab has updatePresetBasedOnDates or similar logic
  // It has tdyDurationDays. It might hide the end date based on selectedPresetDays.
  code = code.replace(
    /\{selectedPresetDays !== 1 && \(/,
    `{selectedPresetDays !== 1 && selectedPresetDays !== -1 && (`
  );

  fs.writeFileSync(file, code);
}

function fixTdyRegisterView() {
  let file = 'src/components/TdyRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /\{presetDays !== 1 && \(/,
    `{presetDays !== 1 && presetDays !== -1 && (`
  );

  fs.writeFileSync(file, code);
}

fixAssignDuty();
fixAssignTdy();
fixTdyRegisterView();

console.log('Fixed single date mode');
