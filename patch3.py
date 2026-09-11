import sys

with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

target1 = """            else if (yestCodeStr === 'DUTY_OFF') offShort = yestAss.previousDutyName || 'GD Off';
            else offShort = `${yestAss.dutyCode} Off`;"""

replacement1 = """            else if (yestCodeStr === 'DUTY_OFF') offShort = yestAss.previousDutyName || 'GD Off';
            else if (yestCodeStr === 'ON_PARADE') offShort = 'GD Off';
            else offShort = `${yestAss.dutyCode} Off`;"""

if target1 in code:
    code = code.replace(target1, replacement1)
    print('Replaced target1 in localDatabase!')
else:
    print('Target1 not found in localDatabase')

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)
