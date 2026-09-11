import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                  } else if (statusInfo.type === 'ON_PARADE' || statusInfo.type === 'NIGHT_OFF' || statusInfo.label === 'Canteen') {
                    // On Parade, Duty Off, or Canteen are always eligible
                    isEligible = true;
                  }"""

new_logic = """                  } else if (statusInfo.type === 'ON_PARADE' || statusInfo.type === 'NIGHT_OFF' || statusInfo.label === 'Canteen' || statusInfo.type === 'CANTEEN') {
                    // On Parade, Duty Off, or Canteen are always eligible
                    isEligible = true;
                  }"""

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
