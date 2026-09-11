import sys

with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

target = """          else if (yestAss.dutyCode === 'DUTY_OFF') offShort = yestAss.previousDutyName || yestAss.notes || 'Duty Off';
          else offShort = `${yestAss.dutyCode} Off`;"""

replacement = """          else if (yestAss.dutyCode === 'DUTY_OFF') offShort = yestAss.previousDutyName || yestAss.notes || 'Duty Off';
          else if (yestAss.dutyCode === 'ON_PARADE') offShort = 'Duty Off';
          else offShort = `${yestAss.dutyCode} Off`;"""

if target in code:
    code = code.replace(target, replacement)
    print('Replaced in localDatabase!')
else:
    print('Target not found in localDatabase')

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)
