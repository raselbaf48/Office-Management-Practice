import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify isEligible logic
old_logic = """                  let isEligible = false;
                  if (isCurrentDutyAssigned) {
                    // Always allow clicking to unassign
                    isEligible = true;
                  } else if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
                    // User requirement: For IDAC Duty, all personnel in the flight are visible and eligible, even if on other disposal
                    isEligible = true;
                  } else if (statusInfo.type === 'ON_PARADE' || statusInfo.type === 'NIGHT_OFF') {
                    // On Parade or Duty Off are always eligible
                    isEligible = true;
                  }"""

new_logic = """                  let isEligible = false;
                  if (airman.name && airman.name.toLowerCase().includes('nishad')) {
                      // Custom rule: Nishad cannot be assigned any duty
                      isEligible = false;
                  } else if (isCurrentDutyAssigned) {
                    // Always allow clicking to unassign
                    isEligible = true;
                  } else if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
                    // User requirement: For IDAC Duty, all personnel in the flight are visible and eligible, even if on other disposal
                    isEligible = true;
                  } else if (statusInfo.type === 'ON_PARADE' || statusInfo.type === 'NIGHT_OFF' || statusInfo.label === 'Canteen') {
                    // On Parade, Duty Off, or Canteen are always eligible
                    isEligible = true;
                  }"""

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
