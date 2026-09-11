import sys

with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code = f.read()

replacement = """      const firstDuty = airmanAssignments[0];
      let name = DUTY_TYPE_MAP.get(firstDuty.dutyCode as any)?.name || firstDuty.dutyCode;
      if (firstDuty.dutyCode === 'DUTY_OFF') {
        if (prevAssignments.length > 0) {
          const yestAss = prevAssignments[0];
          
          const isHeavy =
            ['GD', 'BTF', 'NTF', 'AIRPORT', 'ATT', 'HALISHAHAR'].includes(yestAss.dutyCode) ||
            ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') ||
            (yestAss.notes || '').toLowerCase().includes('idac');
          
          if (!isHeavy && yestAss.dutyCode !== 'DUTY_OFF') {
            return { label: 'On Parade', type: 'ON_PARADE', isFixed: false };
          }
          
          let offShort = 'GD Off';
          if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
          else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
          else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
          else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
          else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
          else if (yestAss.notes?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
          else offShort = 'GD Off';
          
          name = offShort;
        } else {
          name = firstDuty.previousDutyName || firstDuty.notes || 'GD Off';
        }
      }
      return { label: name, type: firstDuty.dutyCode, isFixed: false };"""

code = code.replace("""      const firstDuty = airmanAssignments[0];
      let name = DUTY_TYPE_MAP.get(firstDuty.dutyCode as any)?.name || firstDuty.dutyCode;
      if (firstDuty.dutyCode === 'DUTY_OFF') {
        if (prevAssignments.length > 0) {
          const yestAss = prevAssignments[0];
          let offShort = 'GD Off';
          if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
          else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
          else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
          else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
          else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
          else if (yestAss.notes?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
          else offShort = 'GD Off';
          
          name = offShort;
        } else {
          name = firstDuty.previousDutyName || firstDuty.notes || 'GD Off';
        }
      }
      return { label: name, type: firstDuty.dutyCode, isFixed: false };""", replacement)

with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code)
print('Done AssignDutyModal')
