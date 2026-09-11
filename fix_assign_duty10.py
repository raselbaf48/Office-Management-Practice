import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_canteen = """      // Leave
      const leave = airmanAssignments.find((a) => a.dutyCode === 'LEAVE');"""

new_canteen = """      // Canteen Explicit Duty Code
      const canteen = airmanAssignments.find((a) => a.dutyCode === 'CANTEEN');
      if (canteen) return { label: 'Canteen', type: 'CANTEEN', isFixed: false };

      // Leave
      const leave = airmanAssignments.find((a) => a.dutyCode === 'LEAVE');"""

content = content.replace(old_canteen, new_canteen)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
