import { FlightName, DutyCategoryCode, IDAShift } from '../types';
import { FlightDutyQuota } from './dutyRatios';

export interface DutyRatioTable {
  id: string;
  title: string; // e.g., 'SECURITY DUTY (88)'
  dutyCode: DutyCategoryCode;
  shiftLabel?: string; // e.g. 'Morning', 'Afternoon', 'Night'
  totalRequiredMonth: number;
  data: {
    Mechanics: number[]; // Array of 31 numbers (index 0 = day 1, index 30 = day 31)
    Avionics: number[];
    GCS: number[];
    Admin: number[];
  };
}

export const INITIAL_OFFICIAL_DUTY_MATRIX: DutyRatioTable[] = [
  // 1. BASE SECURITY DUTY
  {
    id: 'security_duty',
    title: 'BASE SECURITY DUTY',
    dutyCode: 'GD',
    totalRequiredMonth: 88,
    data: {
      Mechanics: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1],
      Avionics:  [1,1,1,0,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1,1,0,1,0,0,1,1,1,0,1,1,1],
      GCS:       [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1],
      Admin:     [0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1],
    },
  },

  // 2. BASE TASKFORCE DUTY
  {
    id: 'base_tf',
    title: 'BASE TASKFORCE DUTY',
    dutyCode: 'BTF',
    totalRequiredMonth: 22,
    data: {
      Mechanics: [0,0,1,1,0,0,1,1,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
      Avionics:  [1,1,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      GCS:       [0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
      Admin:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    },
  },

  // 3. NAZIRPARA TARKFORCE DUTY
  {
    id: 'nazirpara_tf',
    title: 'NAZIRPARA TARKFORCE DUTY',
    dutyCode: 'NTF',
    totalRequiredMonth: 40,
    data: {
      Mechanics: [1,1,0,0,0,0,1,1,0,1,1,0,0,0,1,0,0,0,1,1,0,0,1,0,1,0,1,1,0,0,1],
      Avionics:  [0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,1,1,0,1,0,0,0,0,0,1,1],
      GCS:       [1,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,0,1,1,0,1,1,0],
      Admin:     [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },

  // 4. IDAC MORNING
  {
    id: 'idac_mor',
    title: 'IDAC MORNING',
    dutyCode: 'IDAC',
    shiftLabel: 'Morning',
    totalRequiredMonth: 31,
    data: {
      Mechanics: [1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0],
      Avionics:  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0],
      GCS:       [0,1,0,1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,0,1,1,0,1,0,0,0,1,0,0,0,1],
      Admin:     [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    },
  },

  // 5. IDAC AFTERNOON
  {
    id: 'idac_an',
    title: 'IDAC AFTERNOON',
    dutyCode: 'IDAC',
    shiftLabel: 'Afternoon',
    totalRequiredMonth: 31,
    data: {
      Mechanics: [0,1,0,1,0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,0,0,0,1,1,0,0,1,0,0],
      Avionics:  [1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1,0,0,1,1],
      GCS:       [0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0],
      Admin:     [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },

  // 6. IDAC NIGHT
  {
    id: 'idac_nt',
    title: 'IDAC NIGHT',
    dutyCode: 'IDAC',
    shiftLabel: 'Night',
    totalRequiredMonth: 62,
    data: {
      Mechanics: [0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1],
      Avionics:  [0,0,1,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,1,1,0,1,1,1,1,0,0,1,1],
      GCS:       [1,1,0,1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,0],
      Admin:     [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },

  // 7. AIRFIELD DUTY
  {
    id: 'airport_duty',
    title: 'AIRFIELD DUTY',
    dutyCode: 'AIRPORT',
    totalRequiredMonth: 93,
    data: {
      Mechanics: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      Avionics:  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      GCS:       [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      Admin:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },

  // 8. HALISHAHAR TASKFIRCE DUTY
  {
    id: 'halishahar_duty',
    title: 'HALISHAHAR TASKFIRCE DUTY',
    dutyCode: 'HALISHAHAR',
    totalRequiredMonth: 7,
    data: {
      Mechanics: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      Avionics:  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      GCS:       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      Admin:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },
];

export function parseDayNumber(dateStr: string): number {
  if (!dateStr) return 1;
  const trimmed = dateStr.trim();
  // Handle ISO or YYYY-MM-DD
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length >= 3) {
      const d = parseInt(parts[2].slice(0, 2), 10);
      if (!isNaN(d) && d >= 1 && d <= 31) return d;
    }
  }
  // Handle MM/DD/YYYY or DD/MM/YYYY
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length >= 3) {
      // In MM/DD/YYYY, parts[1] is the day
      const d1 = parseInt(parts[1], 10);
      if (!isNaN(d1) && d1 >= 1 && d1 <= 31) return d1;
      // In DD/MM/YYYY, parts[0] is the day
      const d0 = parseInt(parts[0], 10);
      if (!isNaN(d0) && d0 >= 1 && d0 <= 31) return d0;
      const d2 = parseInt(parts[2], 10);
      if (!isNaN(d2) && d2 >= 1 && d2 <= 31) return d2;
    }
  }
  const dt = new Date(trimmed);
  if (!isNaN(dt.getTime())) {
    return dt.getDate();
  }
  return 1;
}

const MATRIX_STORAGE_KEY = 'baf_official_duty_matrix_v4';

export function getStoredDutyMatrix(): DutyRatioTable[] {
  try {
    const raw = localStorage.getItem(MATRIX_STORAGE_KEY) || localStorage.getItem('baf_official_duty_matrix_v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Map over parsed and ensure official updated titles are synchronized while preserving user custom data
        const titleMap = new Map(INITIAL_OFFICIAL_DUTY_MATRIX.map((t) => [t.id, t.title]));
        const updatedParsed = parsed.map((t: DutyRatioTable) => ({
          ...t,
          title: titleMap.get(t.id) || t.title,
        }));
        const existingIds = new Set(updatedParsed.map((t: DutyRatioTable) => t.id));
        const missing = INITIAL_OFFICIAL_DUTY_MATRIX.filter((t) => !existingIds.has(t.id));
        if (missing.length > 0) {
          return [...updatedParsed, ...missing];
        }
        return updatedParsed;
      }
    }
  } catch (e) {
    console.error('Failed to load stored duty matrix:', e);
  }
  return INITIAL_OFFICIAL_DUTY_MATRIX;
}

export function saveDutyMatrix(matrix: DutyRatioTable[]) {
  try {
    localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(matrix));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated', { detail: { matrix } }));
    }
  } catch (e) {
    console.error('Failed to save duty matrix:', e);
  }
}

export function resetDutyMatrixToDefault(): DutyRatioTable[] {
  try {
    localStorage.removeItem(MATRIX_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated', { detail: { matrix: INITIAL_OFFICIAL_DUTY_MATRIX } }));
    }
  } catch (e) {
    console.error('Failed to reset matrix:', e);
  }
  return INITIAL_OFFICIAL_DUTY_MATRIX;
}

/**
 * Calculates exact FlightDutyQuota[] for any given date string (e.g., '2026-08-12')
 * by extracting the day number (1..31) and summing quotas across all duty tables.
 */
export function getDailyQuotasFromMatrix(dateStr: string): FlightDutyQuota[] {
  const matrix = getStoredDutyMatrix();
  const dayNum = parseDayNumber(dateStr);
  const dayIndex = Math.max(0, Math.min(30, dayNum - 1));

  const flightQuotaMap: Record<FlightName, Partial<Record<DutyCategoryCode, number>>> = {
    Avionics: {},
    Mechanics: {},
    GCS: {},
    Admin: {},
  };

  const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];

  matrix.forEach((table) => {
    flights.forEach((fl) => {
      const val = table.data[fl]?.[dayIndex] || 0;
      flightQuotaMap[fl][table.dutyCode] = (flightQuotaMap[fl][table.dutyCode] || 0) + val;
    });
  });

  const result: FlightDutyQuota[] = [];
  flights.forEach((fl) => {
    Object.entries(flightQuotaMap[fl]).forEach(([dCode, count]) => {
      if (count && count > 0) {
        result.push({
          flight: fl,
          dutyCode: dCode as DutyCategoryCode,
          requiredCount: count,
        });
      }
    });
  });

  return result;
}

/**
 * Returns available IDAC shifts ('Morning', 'Afternoon', 'Night') for a given date and flight,
 * strictly based on whether IDAC quota > 0 for that specific shift in the Official Duty Ratio Matrix.
 */
export function getIdacShiftsForDateAndFlight(dateStr: string, flight?: FlightName): IDAShift[] {
  if (!dateStr) return ['Morning', 'Afternoon', 'Night'];

  const dayNum = parseDayNumber(dateStr);
  const dayIndex = Math.max(0, Math.min(30, dayNum - 1));

  const matrix = getStoredDutyMatrix();

  const morTable = matrix.find((t) => t.id === 'idac_mor' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Morning'));
  const anTable = matrix.find((t) => t.id === 'idac_an' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Afternoon'));
  const ntTable = matrix.find((t) => t.id === 'idac_nt' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Night'));

  const isSpecificFlight = flight && flight !== ('All' as any);
  const flightsToCheck: FlightName[] = isSpecificFlight
    ? [flight]
    : ['Mechanics', 'Avionics', 'GCS', 'Admin'];

  let morQuota = 0;
  let anQuota = 0;
  let ntQuota = 0;

  flightsToCheck.forEach((f) => {
    if (morTable?.data[f]) morQuota += morTable.data[f][dayIndex] || 0;
    if (anTable?.data[f]) anQuota += anTable.data[f][dayIndex] || 0;
    if (ntTable?.data[f]) ntQuota += ntTable.data[f][dayIndex] || 0;
  });

  const availableShifts: IDAShift[] = [];
  if (morQuota > 0) availableShifts.push('Morning');
  if (anQuota > 0) availableShifts.push('Afternoon');
  if (ntQuota > 0) availableShifts.push('Night');

  // If a specific flight is chosen, return ONLY the shifts that have quota for this flight!
  // If no flight is specified (Overall / All) and all quotas are 0, return all 3 standard shifts
  if (!isSpecificFlight && availableShifts.length === 0) {
    return ['Morning', 'Afternoon', 'Night'];
  }

  return availableShifts;
}

/**
 * Returns the exact scheduled quota for a given date, flight, duty code, and optional shift.
 */
export function getFlightDutyQuotaForDate(
  dateStr: string,
  flight: FlightName,
  dutyCode: DutyCategoryCode,
  shiftLabel?: string
): number {
  if (!dateStr || !flight) return 0;
  const dayNum = parseDayNumber(dateStr);
  const dayIndex = Math.max(0, Math.min(30, dayNum - 1));

  const matrix = getStoredDutyMatrix();

  let table: DutyRatioTable | undefined;
  if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
    if (shiftLabel === 'Morning') {
      table = matrix.find((t) => t.id === 'idac_mor' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Morning'));
    } else if (shiftLabel === 'Afternoon') {
      table = matrix.find((t) => t.id === 'idac_an' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Afternoon'));
    } else if (shiftLabel === 'Night') {
      table = matrix.find((t) => t.id === 'idac_nt' || (t.dutyCode === 'IDAC' && t.shiftLabel === 'Night'));
    } else {
      table = matrix.find((t) => t.dutyCode === 'IDAC');
    }
  } else if (dutyCode === 'GD') {
    table = matrix.find((t) => t.id === 'security_duty' || t.dutyCode === 'GD');
  } else if (dutyCode === 'NTF') {
    table = matrix.find((t) => t.id === 'nazirpara_tf' || t.dutyCode === 'NTF');
  } else if (dutyCode === 'BTF') {
    table = matrix.find((t) => t.id === 'base_tf' || t.dutyCode === 'BTF');
  } else if (dutyCode === 'HALISHAHAR') {
    table = matrix.find((t) => t.id === 'halishahar_duty' || t.dutyCode === 'HALISHAHAR');
  } else if (dutyCode === 'AIRPORT') {
    table = matrix.find((t) => t.id === 'airport_duty' || t.dutyCode === 'AIRPORT');
  } else {
    table = matrix.find((t) => t.dutyCode === dutyCode);
  }

  if (!table) return 0;
  return table.data[flight]?.[dayIndex] || 0;
}
