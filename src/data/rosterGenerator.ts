import { Airman, DutyAssignment, DutyCategoryCode, ConflictAlert, AirmanDutyStats } from '../types';
import { DUTY_TYPE_MAP } from './dutyTypes';
import { generateOfficialMonthAssignments } from './officialJulyAugustData';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function formatMonthKey(year: number, month: number): string {
  const m = month < 10 ? `0${month}` : `${month}`;
  return `${year}-${m}`;
}

export function generateSeedAssignments(airmen: Airman[], year: number, month: number): DutyAssignment[] {
  // If July or August 2026, load the official authentic UASU parade state records
  if (month === 7 || month === 8) {
    return generateOfficialMonthAssignments(year, month);
  }

  const assignments: DutyAssignment[] = [];
  const totalDays = getDaysInMonth(year, month);
  const monthStr = month < 10 ? `0${month}` : `${month}`;

  // Deterministic seed generation based on airman index and day
  airmen.forEach((airman, index) => {
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const date = `${year}-${monthStr}-${dayStr}`;

      // Leave pattern
      if ((index === 46 && day >= 10 && day <= 18) || (index === 8 && day >= 20 && day <= 25)) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'LEAVE',
          notes: 'Casual Leave (CL)',
        });
        continue;
      }

      // TDY pattern
      if (index === 10 && day >= 5 && day <= 15) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'TDY',
          notes: 'Joint Ops Command HQ TDY',
        });
        continue;
      }

      // Cycle duties amongst non-SWO/WO airmen
      const hash = (index * 7 + day * 13) % 31;

      if (hash === 1 || hash === 15) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'GD',
          notes: 'Gate-1 Guard Post',
        });
      } else if (hash === 3) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'BTF',
          notes: 'Base Patrol Taskforce',
        });
      } else if (hash === 5) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'NTF',
          notes: 'Najirpara Perimeter',
        });
      } else if (hash === 8) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'HALISHAHAR',
          notes: 'Halishahar Taskforce',
        });
      } else if (hash === 12) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'AIRPORT',
          notes: 'Airfield Duty',
        });
      } else if (hash === 15) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'IDAC',
          idaShift: 'Morning',
          notes: 'IDAC Shift A',
        });
      } else if (hash === 17) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'BAKE_N_BITE',
        });
      } else if (hash === 22) {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'DUTY_OFF',
        });
      } else {
        assignments.push({
          airmanId: airman.id,
          date,
          dutyCode: 'ON_PARADE',
        });
      }
    }
  });

  return assignments;
}

export function resolveAirmanDutyForDate(
  airmanId: string,
  dateStr: string,
  assignmentMap: Map<string, DutyAssignment>
): DutyAssignment {
  const directKey = `${airmanId}_${dateStr}`;
  if (assignmentMap.has(directKey)) {
    return assignmentMap.get(directKey)!;
  }

  // Calculate previous date D-1
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const yestStr = `${year}-${month}-${day}`;
  const yestKey = `${airmanId}_${yestStr}`;

  const yestAss = assignmentMap.get(yestKey);
  if (yestAss) {
    const isHeavyDuty =
      ['GD', 'BTF', 'NTF', 'AIRPORT'].includes(yestAss.dutyCode) ||
      ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night');

    if (isHeavyDuty) {
      return {
        airmanId,
        date: dateStr,
        dutyCode: 'DUTY_OFF',
        notes: 'Auto Duty Off (Post Night/Heavy Duty)',
      };
    }
  }

  // Default: On Parade
  return {
    airmanId,
    date: dateStr,
    dutyCode: 'ON_PARADE',
    notes: '',
  };
}

export function calculateDutyStats(
  airmen: Airman[],
  assignments: DutyAssignment[],
  year?: number,
  month?: number
): AirmanDutyStats[] {
  const map = new Map<string, AirmanDutyStats>();

  airmen.forEach((a) => {
    map.set(a.id, {
      airmanId: a.id,
      airmanName: a.name,
      rank: a.rank,
      bdNo: a.bdNo,
      flightName: a.flightName,
      totalGD: 0,
      totalBTF: 0,
      totalNTF: 0,
      totalHalishahar: 0,
      totalAirport: 0,
      totalIDAC: 0,
      totalBakeNBite: 0,
      totalTDY: 0,
      totalLeave: 0,
      totalDutyOff: 0,
      totalDutyCount: 0,
    });
  });

  const assignmentMap = new Map<string, DutyAssignment>();
  assignments.forEach((ass) => {
    assignmentMap.set(`${ass.airmanId}_${ass.date}`, ass);
  });

  if (year && month) {
    const totalDays = getDaysInMonth(year, month);
    const monthStr = month < 10 ? `0${month}` : `${month}`;

    airmen.forEach((airman) => {
      const stat = map.get(airman.id);
      if (!stat) return;

      for (let day = 1; day <= totalDays; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const ass = resolveAirmanDutyForDate(airman.id, dateStr, assignmentMap);

        switch (ass.dutyCode) {
          case 'GD':
            stat.totalGD++;
            stat.totalDutyCount++;
            break;
          case 'BTF':
            stat.totalBTF++;
            stat.totalDutyCount++;
            break;
          case 'NTF':
            stat.totalNTF++;
            stat.totalDutyCount++;
            break;
          case 'HALISHAHAR':
            stat.totalHalishahar++;
            stat.totalDutyCount++;
            break;
          case 'AIRPORT':
            stat.totalAirport++;
            stat.totalDutyCount++;
            break;
          case 'IDAC':
          case 'IDA':
            stat.totalIDAC++;
            stat.totalDutyCount++;
            break;
          case 'BAKE_N_BITE':
            stat.totalBakeNBite++;
            break;
          case 'TDY':
            stat.totalTDY++;
            break;
          case 'LEAVE':
            stat.totalLeave++;
            break;
          case 'DUTY_OFF':
            stat.totalDutyOff++;
            break;
        }
      }
    });
  } else {
    // Fallback if no specific year/month provided
    assignments.forEach((ass) => {
      const stat = map.get(ass.airmanId);
      if (!stat) return;

      switch (ass.dutyCode) {
        case 'GD':
          stat.totalGD++;
          stat.totalDutyCount++;
          break;
        case 'BTF':
          stat.totalBTF++;
          stat.totalDutyCount++;
          break;
        case 'NTF':
          stat.totalNTF++;
          stat.totalDutyCount++;
          break;
        case 'HALISHAHAR':
          stat.totalHalishahar++;
          stat.totalDutyCount++;
          break;
        case 'AIRPORT':
          stat.totalAirport++;
          stat.totalDutyCount++;
          break;
        case 'IDAC':
        case 'IDA':
          stat.totalIDAC++;
          stat.totalDutyCount++;
          break;
        case 'BAKE_N_BITE':
          stat.totalBakeNBite++;
          break;
        case 'TDY':
          stat.totalTDY++;
          break;
        case 'LEAVE':
          stat.totalLeave++;
          break;
        case 'DUTY_OFF':
          stat.totalDutyOff++;
          break;
      }
    });
  }

  return Array.from(map.values());
}

export function detectConflicts(airmen: Airman[], assignments: DutyAssignment[]): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  const airmanMap = new Map(airmen.map((a) => [a.id, a]));

  // Group assignments by airman
  const byAirman = new Map<string, DutyAssignment[]>();
  assignments.forEach((ass) => {
    const list = byAirman.get(ass.airmanId) || [];
    list.push(ass);
    byAirman.set(ass.airmanId, list);
  });

  byAirman.forEach((list, airmanId) => {
    const airman = airmanMap.get(airmanId);
    if (!airman) return;

    // Group assignments by date for this airman so each date is evaluated exactly once
    const byDate = new Map<string, DutyAssignment[]>();
    list.forEach((ass) => {
      const dateList = byDate.get(ass.date) || [];
      dateList.push(ass);
      byDate.set(ass.date, dateList);
    });

    byDate.forEach((dateAssignments, date) => {
      // 1. Check double assignment on same date with active duty + leave/tdy
      if (dateAssignments.length > 1) {
        const hasLeaveOrTdy = dateAssignments.some((a) => a.dutyCode === 'LEAVE' || a.dutyCode === 'TDY');
        const hasDuty = dateAssignments.some((a) => 
          ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT', 'IDAC', 'IDA', 'BAKE_N_BITE'].includes(a.dutyCode)
        );
        if (hasLeaveOrTdy && hasDuty) {
          alerts.push({
            id: `conflict-leavetdy-${airmanId}-${date}`,
            airmanId,
            airmanName: `${airman.rank} ${airman.name}`,
            date,
            severity: 'error',
            message: `ছুটি (Leave) অথবা TDY চলাকালীন অবস্থায় কোনো দায়িত্ব (Duty) দেওয়া যাবে না। ${airman.rank} ${airman.name} ${date} তারিখে ছুটি/টিডিওয়াই তালিকায় থাকা সত্ত্বেও ডিউটি নির্ধারিত হয়েছে।`,
            ruleType: 'LEAVE_TDY_OVERLAP',
          });
        }
      }

      // 2. Check Guard Duty (GD) rank limitation: Strictly Cpl & Below
      const hasGD = dateAssignments.some((a) => a.dutyCode === 'GD');
      if (hasGD && ['SWO', 'WO', 'Sgt'].includes(airman.rank)) {
        alerts.push({
          id: `conflict-gd-rank-${airmanId}-${date}`,
          airmanId,
          airmanName: `${airman.rank} ${airman.name}`,
          date,
          severity: 'error',
          message: `গার্ড ডিউটি (GD) শুধুমাত্র Cpl ও LAC এর জন্য প্রযোজ্য। ${airman.rank} ${airman.name} কে ${date} তারিখে GD অ্যাসাইন করা নিয়মবহির্ভূত।`,
          ruleType: 'RANK_INELIGIBLE_GD',
        });
      }
    });
  });

  // Strict deduplication by alert id
  const seenIds = new Set<string>();
  const uniqueAlerts: ConflictAlert[] = [];
  for (const al of alerts) {
    if (!seenIds.has(al.id)) {
      seenIds.add(al.id);
      uniqueAlerts.push(al);
    }
  }

  return uniqueAlerts;
}

export function getAirmanShortCode(airman: Airman): string {
  if (!airman) return '';
  if (airman.code && !airman.code.includes('-')) return airman.code;
  const nameMap: Record<string, string> = {
    'Moshiur': 'MSR',
    'G. Mostafa': 'MGER',
    'Jahid': 'JHD',
    'Mojaffar': 'MJF',
    'A. Baten': 'BTN',
    'Shahin': 'SHN',
    'Lutfar': 'LPR',
    'Aminul': 'AMN',
    'Uzzal': 'UZL',
    'Riaz': 'RIAZ',
    'Mobarak': 'MBK',
    'Rubel': 'RBL',
    'Absar': 'ABSR',
    'Mahid': 'MAHD',
    'Asad': 'ASD',
    'Fokrul': 'FKL',
    'Shishir': 'SSR',
    'Mustakim': 'MKM',
    'Sojib': 'SSJB',
    'Mehedi': 'MHDE',
    'Ripon': 'RPN',
    'A. Gafur': 'GFR',
    'Shohel': 'SHL',
    'Imran': 'IMRN',
    'Nahid': 'NSD',
    'Harun': 'HRN',
    'Omar': 'OMR',
    'Ismail': 'ISM',
    'Ahsan': 'AHSN',
    'Koraishi': 'KORS',
    'Sajib': 'SIB',
    'Maraz': 'MRZ',
    'Shariful': 'SFL',
    'Akash': 'AKS',
    'Rasel': 'RSL',
    'Mahedi': 'MAHD',
    'Rakib': 'RKB',
    'Joy': 'JOY',
    'Ashraful': 'ASRF',
    'Hridoy': 'HDY',
    'Nishad': 'NSD',
    'Zakirul': 'ZKL',
    'Zubayer': 'ZBR',
    'Tusar': 'THN',
    'Adnan': 'ADN',
    'Rashed': 'RSD',
    'Saidul': 'SDL',
  };
  if (nameMap[airman.name]) return nameMap[airman.name];
  if (airman.code && airman.code.includes('-')) {
    const parts = airman.code.split('-');
    return parts[parts.length - 1];
  }
  return airman.name.substring(0, 4).toUpperCase();
}
