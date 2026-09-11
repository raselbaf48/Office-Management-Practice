import sys

with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

target = """        else if (codeStr === 'DUTY_OFF') {
          if (isPT) {
            return {
              dutyCode: 'ON_PARADE',
              dutyName: 'On PT',
              notes: '',
              statusCategory: 'PARADE',
              disposalScope: scope,
            };
          }
          const yestAss = yestMap.get(airmanId);
          let offShort = 'GD Off';
          if (yestAss) {"""

# Replace windows or different newlines matching
code = code.replace("        else if (codeStr === 'DUTY_OFF') {\n          if (isPT) {\n            return {\n              dutyCode: 'ON_PARADE',\n              dutyName: 'On PT',\n              notes: '',\n              statusCategory: 'PARADE',\n              disposalScope: scope,\n            };\n          }\n          const yestAss = yestMap.get(airmanId);\n          let offShort = 'GD Off';\n          if (yestAss) {",
"""        else if (codeStr === 'DUTY_OFF') {
          if (isPT) {
            return {
              dutyCode: 'ON_PARADE',
              dutyName: 'On PT',
              notes: '',
              statusCategory: 'PARADE',
              disposalScope: scope,
            };
          }
          const yestAss = yestMap.get(airmanId);
          
          if (yestAss) {
            const yestCodeStr = String(yestAss.dutyCode);
            const isHeavy =
              ['GD', 'BTF', 'NTF', 'AIRPORT', 'ATT', 'HALISHAHAR'].includes(yestCodeStr) ||
              ((yestCodeStr === 'IDAC' || yestCodeStr === 'IDA') && yestAss.idaShift === 'Night') ||
              (yestAss.notes || '').toLowerCase().includes('idac');
              
            if (!isHeavy && yestCodeStr !== 'DUTY_OFF') {
              return {
                dutyCode: 'ON_PARADE',
                dutyName: 'On Parade',
                notes: '',
                statusCategory: 'PARADE',
                disposalScope: scope,
              };
            }
          }
          
          let offShort = 'GD Off';
          if (yestAss) {""")

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)
print('Done!')
