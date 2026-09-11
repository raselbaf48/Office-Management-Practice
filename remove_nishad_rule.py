import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                  let isEligible = false;
                  if (airman.name && airman.name.toLowerCase().includes('nishad')) {
                      // Custom rule: Nishad cannot be assigned any duty
                      isEligible = false;
                  } else if (isCurrentDutyAssigned) {"""

new_logic = """                  let isEligible = false;
                  if (isCurrentDutyAssigned) {"""

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
