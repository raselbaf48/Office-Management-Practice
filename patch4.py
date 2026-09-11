import sys

# Patch localDatabase.ts
with open('src/services/localDatabase.ts', 'r') as f:
    code = f.read()

code = code.replace("let offShort = 'Duty Off';", "let offShort = 'GD Off';")
code = code.replace("|| yestAss.notes || 'Duty Off';", "|| yestAss.notes || 'GD Off';")
code = code.replace("offShort = 'Duty Off';", "offShort = 'GD Off';")

with open('src/services/localDatabase.ts', 'w') as f:
    f.write(code)

# Patch AssignDutyModal.tsx
with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code2 = f.read()

code2 = code2.replace("let offShort = 'Duty Off';", "let offShort = 'GD Off';")
code2 = code2.replace("else offShort = 'Duty Off';", "else offShort = 'GD Off';")
code2 = code2.replace("|| firstDuty.notes || 'Duty Off';", "|| firstDuty.notes || 'GD Off';")
code2 = code2.replace("statusInfo.type === 'DUTY_OFF'", "statusInfo.type === 'DUTY_OFF' || statusInfo.type === 'GD Off'") # just in case

with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code2)

print('Replaced Duty Off with GD Off')
