import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_canteen = """      // Leave
      const leave = airmanAssignments.find((a) => a.dutyCode === 'LEAVE');"""

new_canteen = """      // Deployment (Canteen/Reception)
      const deployment = airmanAssignments.find((a) => a.dutyCode === 'DEPLOYMENT');
      if (deployment) {
         if ((deployment.notes || '').toLowerCase().includes('canteen')) {
             return { label: 'Canteen', type: 'DEPLOYMENT', isFixed: false };
         }
         return { label: deployment.notes || 'Deployment', type: 'DEPLOYMENT', isFixed: true };
      }

      // Leave
      const leave = airmanAssignments.find((a) => a.dutyCode === 'LEAVE');"""

content = content.replace(old_canteen, new_canteen)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
