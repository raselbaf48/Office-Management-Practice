import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

start_str = "const isPtIdacA = isPtDocument && codeUpper === 'IDAC' && idaShift === 'Morning';"
end_str = "} else {\n    targetAirmen.forEach((airman) => {"
start_idx = code.find(start_str)
end_idx = code.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_block = """const isNightCountIdacA = codeUpper === 'IDAC' && idaShift === 'Morning';
      const isDutyOff = codeUpper === 'DUTY_OFF' || codeUpper === 'OFF_DUTY' || statusCategory === 'OFF' || notesLower.includes('off duty') || notesLower.includes('nt off') || notesLower.includes('night off');
      const isIdacB = codeUpper === 'IDAC' && idaShift === 'Afternoon';
      const isIdacC = codeUpper === 'IDAC' && idaShift === 'Night';
      const isBake = ['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE';

      if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE' || isNightCountIdacA || isDutyOff) {
        onPtList.push({ airman, note: '' });
      } else if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
        leaveList.push({ airman, note: '' });
      } else if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
        essnList.push({ airman, note: 'ESSN' });
      } else if (['CMH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh')) {
        cmhList.push({ airman, note: item.dutyName || dutyCode || 'CMH' });
      } else if (['SICK_REPORT', 'SICK', 'EX_PPGF'].includes(codeUpper) || notesLower.includes('sick') || notesLower.includes('ppgf')) {
        sickReportList.push({ airman, note: item.dutyName || dutyCode || 'Sick Report' });
      } else if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper) || notesLower.includes('drill')) {
        drillCatCList.push({ airman, note: "Drill Cat 'C'" });
      } else if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
        tdyList.push({ airman, note: 'TDY' });
      } else if (codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
        receptionList.push({ airman, note: 'Reception' });
      } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'ATT'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
        airFdDutyList.push({ airman, note: 'Air Fd Duty' });
      } else if (['ADMIN_ORDER', 'BOI', 'COMMITTEE'].includes(codeUpper) || notesLower.includes('admin order') || notesLower.includes('boi')) {
        adminOrderList.push({ airman, note: 'Admin Order' });
      } else if (['CLASS_TRG', 'CLASS', 'TRG', 'LTTB'].includes(codeUpper) || notesLower.includes('class') || notesLower.includes('trg')) {
        classTrgList.push({ airman, note: 'Class/Trg' });
      } else if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper) || notesLower.includes('games') || notesLower.includes('g/h')) {
        gamesList.push({ airman, note: 'G/H & Games' });
      } else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
        absentList.push({ airman, note: 'Absent' });
      } else if (isBake || isIdacB || isIdacC || codeUpper === 'OFFICE' || notesLower.includes('office')) {
        // Now grouped under Office Duty
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: dutyDisplay });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'AIRPORT', 'AIRFIELD', 'ATT', 'AIR_FD'].includes(codeUpper) || statusCategory === 'DUTY') {
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: dutyDisplay });
      } else {
        let customKey = dutyCode === 'OTHERS' ? (notes || 'OTHER DISPOSAL') : (item.dutyName || dutyCode || 'OTHER DISPOSAL');
        if (notes) {
          if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'BNS', 'BSH', 'SICK_REPORT', 'ED', 'DRILL_CAT_C', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) { 
            customKey = notes; 
          }
        }
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        const safeNotes = notes && !notesLower.includes('imported') ? notes : undefined;
        customDisposalsMap[customKey].push({ airman, note: safeNotes });
      }
    });
  """
    code = code[:start_idx] + new_block + code[end_idx:]
    with open('src/components/NightCountStateView.tsx', 'w') as f:
        f.write(code)
    print("Done")
else:
    print("Could not find block.")
