import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# 1. Update statusList.forEach
start_status = code.find('const isPtIdacA = isPtDocument && codeUpper === \\\'IDAC\\\' && idaShift === \\\'Morning\\\';')
end_status = code.find('    const otherDisposals:', start_status)

if start_status != -1 and end_status != -1:
    new_status = """const isNightCountIdacA = codeUpper === 'IDAC' && idaShift === 'Morning';
      const isDutyOff = codeUpper === 'OFF_DUTY' || codeUpper === 'DUTY_OFF' || statusCategory === 'OFF' || notesLower.includes('off duty') || notesLower.includes('nt off') || notesLower.includes('night off');
      
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
      } else if (isBake) {
        bakeBiteList.push({ airman, note: 'Bake & Bite' });
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
      } else if (isDutyOff) {
        // Handled in ON PARADE
      } else if (isIdacB || isIdacC) {
        // Can route to duty on list or custom
        dutyOnList.push({ airman, note: item.dutyName || dutyCode });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA'].includes(codeUpper) || statusCategory === 'DUTY') {
        dutyOnList.push({ airman, note: item.dutyName || dutyCode });
      } else {
        const customKey = statusCategory || 'OTHER';
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        const safeNotes = notes && !notesLower.includes('imported') ? notes : undefined;
        customDisposalsMap[customKey].push({ airman, note: safeNotes });
      }
    });
  } else {
"""
    code = code[:start_status] + new_status + code[end_status:]


# 2. Update getFlightStats
start_stats = code.find('const isPtIdacA = isPtDocument && codeUpper === \\\'IDAC\\\' && idaShift === \\\'Morning\\\';', 0, start_status)
if start_stats == -1:
    # Look for it generally
    start_stats = code.find('const isPtIdacA = isPtDocument && codeUpper === \'IDAC\'')

end_stats = code.find('const totalStr = flightAirmen.length;', start_stats)

if start_stats != -1 and end_stats != -1:
    new_stats = """const isNightCountIdacA = codeUpper === 'IDAC' && idaShift === 'Morning';
        const isDutyOff = codeUpper === 'DUTY_OFF' || codeUpper === 'OFF_DUTY' || statusCategory === 'OFF' || notesLower.includes('off duty') || notesLower.includes('nt off') || notesLower.includes('night off');
        const isIdacB = codeUpper === 'IDAC' && idaShift === 'Afternoon';
        const isIdacC = codeUpper === 'IDAC' && idaShift === 'Night';
        const isBake = ['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE';

        if (codeUpper === 'ON_PARADE' || statusCategory === 'PARADE' || isNightCountIdacA || isDutyOff) {
          // Available on Parade / PT - Do not add to totalOutPt
        } else if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
          leaveCount++;
        } else if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
          detTdyCount++;
        } else if (codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
          koReceptionCount++;
        } else if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
          essnCount++;
        } else if (['CMH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh')) {
          hospitalCount++;
        } else if (['SICK_REPORT', 'SICK', 'EX_PPGF'].includes(codeUpper) || notesLower.includes('sick') || notesLower.includes('ppgf')) {
          sickExCount++;
        } else if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper) || notesLower.includes('drill')) {
          drillCatCCount++;
        } else if (['ADMIN_ORDER', 'BOI', 'COMMITTEE'].includes(codeUpper) || notesLower.includes('admin order') || notesLower.includes('boi')) {
          adminCommCount++;
        } else if (['CLASS_TRG', 'CLASS', 'TRG', 'LTTB'].includes(codeUpper) || notesLower.includes('class') || notesLower.includes('trg')) {
          classTrgCount++;
        } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'ATT'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
          airFdDutyCount++;
        } else if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper) || notesLower.includes('games') || notesLower.includes('g/h')) {
          gamesCount++;
        } else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
          absentCount++;
        } else if (isBake || isIdacB || isIdacC || codeUpper === 'OFFICE' || notesLower.includes('office')) {
          // They are office duty for the table, but they are OUT for parade.
          othersCount++;
        } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA'].includes(codeUpper) || statusCategory === 'DUTY') {
          guardDutyCount++;
        } else {
          othersCount++;
        }
      });
    }
    """
    code = code[:start_stats] + new_stats + code[end_stats:]

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
