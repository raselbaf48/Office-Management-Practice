import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_success = """          if (onRefreshParadeData) onRefreshParadeData();
          if (onSuccess) onSuccess();
        } else {"""

new_success = """          if (onRefreshParadeData) onRefreshParadeData();
          if (onSuccess) onSuccess();

          // Auto-advance logic
          if (selectionMode === 'FlightFirst' && activeFlight !== 'All' && activeDutyCode) {
            const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
            const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code, undefined, activeFlight) > 0);
            if (ratioFiltered.length > 1) {
              const currentIndex = ratioFiltered.findIndex((d) => d.code === activeDutyCode);
              if (currentIndex !== -1 && currentIndex + 1 < ratioFiltered.length) {
                setActiveDutyCode(ratioFiltered[currentIndex + 1].code);
                if (ratioFiltered[currentIndex + 1].code === 'IDAC' || ratioFiltered[currentIndex + 1].code === 'IDA') {
                   // Optional: attempt to auto-select the first needed shift, but activeIdaShift might be needed
                   setActiveIdaShift(undefined); 
                }
              }
            }
          }
        } else {"""

content = content.replace(old_success, new_success)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
