const fs = require('fs');
let file = fs.readFileSync('src/components/FlgWgHistoryModal.tsx', 'utf-8');

const parseFunc = `
  const parseActionToRaw = (actionStr: string) => {
    const raw: any = {
      totalStr: 0, detTdy: 0, leave: 0, edExPpgf: 0,
      cmhBnsBsh: 0, officeDuty: 0, baseAirfieldDuty: 0, driving: 0
    };
    if (!actionStr) return raw;
    const parts = actionStr.split(',');
    parts.forEach(p => {
       const part = p.trim();
       const match = part.match(/(.+) \\+([0-9]+)/);
       if (match) {
         const label = match[1].trim();
         const val = parseInt(match[2], 10);
         if (label === 'Total Str') raw.totalStr = val;
         if (label === 'Det/Tdy') raw.detTdy = val;
         if (label === 'Leave') raw.leave = val;
         if (label === 'ED/EX') raw.edExPpgf = val;
         if (label === 'CMH') raw.cmhBnsBsh = val;
         if (label === 'Office') raw.officeDuty = val;
         if (label === 'Base/Airfield') raw.baseAirfieldDuty = val;
         if (label === 'Driving') raw.driving = val;
       }
    });
    return raw;
  };
`;

const oldLoadLogs = `    // Assign mock IDs to old logs without IDs so we can key them
    allLogs = allLogs.map(l => l.id ? l : { ...l, id: Math.random().toString(36).substring(7) });
    setLogs(allLogs);
  };`;

const newLoadLogs = `    // Assign mock IDs to old logs without IDs so we can key them
    allLogs = allLogs.map(l => {
      const log = l.id ? l : { ...l, id: Math.random().toString(36).substring(7) };
      if (!log.raw) {
        log.raw = parseActionToRaw(log.action);
      }
      return log;
    });
    setLogs(allLogs);
  };`;

if(file.includes(oldLoadLogs)) {
    file = file.replace(oldLoadLogs, newLoadLogs);
    file = file.replace('  const loadLogs = () => {', parseFunc + '\\n  const loadLogs = () => {');
    fs.writeFileSync('src/components/FlgWgHistoryModal.tsx', file, 'utf-8');
    console.log("Patched successfully");
} else {
    console.log("Could not find injection point");
}
