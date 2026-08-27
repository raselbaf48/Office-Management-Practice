export type FlightName = 'Avionics' | 'Mechanics' | 'GCS' | 'Admin';

export type Rank = 'SWO' | 'WO' | 'Sgt' | 'Cpl' | 'LAC';

export type DutyCategoryCode = 
  | 'GD'           // Base Security Duty
  | 'BTF'          // Base Taskforce Duty
  | 'NTF'          // Najirpara Taskforce Duty
  | 'HALISHAHAR'   // Halishahar Taskforce Duty
  | 'AIRPORT'      // Airport Duty
  | 'IDAC'         // IDAC Duty (Morning / Afternoon / Night)
  | 'IDA'          // Legacy alias for IDAC
  | 'TDY'          // Tdy/Att
  | 'LEAVE'        // Leave
  | 'BAKE_N_BITE'  // Bake N Bite
  | 'DUTY_OFF'     // Duty Off
  | 'ON_PARADE'    // On Parade / Normal Working Status
  | 'ESSN'         // Essential Duty / Task
  | 'CMH'          // BNS / BSH / CMH / Medical
  | 'SICK_REPORT'  // Sick Report / S/Q
  | 'DRILL_CAT_C'  // Drill Cat-C
  | 'ADMIN_ORDER'  // Admin Order
  | 'CLASS_TRG'    // Class / Training
  | 'AIRFIELD_DUTY'// Airfield Duty
  | 'RECEPTION'    // K/O & Reception
  | 'GAMES'        // G/H & Games
  | 'ABSENT';      // Absent

export type IDAShift = 'Morning' | 'Afternoon' | 'Night' | 'None';

export type ParadeShift = 'Morning' | 'Afternoon' | 'Night';

export interface Airman {
  id: string;
  serNo: number;
  code: string;        // e.g., MSR, RSL, OMR, etc.
  bdNo: string;        // e.g. BD/102341
  rank: Rank;
  name: string;
  trade: string;       // e.g. Avionic, Aero Mech, Armt Mech, GCO, Admin
  addressBlock: string;// e.g. Block-B, Qtr 104 / Barrack-3
  mobileNo: string;
  flightName: FlightName;
  remarks: string;
  active: boolean;
}

export interface DutyTypeInfo {
  code: DutyCategoryCode;
  name: string;
  shortName: string;
  category: 'Security' | 'Taskforce' | 'Special' | 'Status' | 'Off';
  color: string;      // Tailwind color classes or hex
  badgeBg: string;
  badgeText: string;
  isCountedAsDuty: boolean;
  requiresShift?: boolean;
  description: string;
}

export interface DutyAssignment {
  airmanId: string;
  date: string;       // YYYY-MM-DD
  dutyCode: DutyCategoryCode;
  idaShift?: IDAShift;
  proxyForFlight?: FlightName;
  disposalScope?: 'ALL' | 'PARADE' | 'PT';
  notes?: string;
  previousDutyName?: string;
  assignedBy?: string;
  updatedAt?: string;
}

export interface DailyParadeState {
  date: string;
  shift: ParadeShift;
  flightName?: FlightName | 'Overall';
  totalStrength: number;
  onParadeCount: number;
  onDutyCount: number;
  onLeaveCount: number;
  tdyCount: number;
  otherOffCount: number;
  flightBreakdown: Record<FlightName, {
    total: number;
    onParade: number;
    onDuty: number;
    onLeave: number;
    tdy: number;
  }>;
}

export interface AirmanDutyStats {
  airmanId: string;
  airmanName: string;
  rank: Rank;
  bdNo: string;
  flightName: FlightName;
  totalGD: number;
  totalBTF: number;
  totalNTF: number;
  totalHalishahar: number;
  totalAirport: number;
  totalIDAC: number;
  totalIDACMorning: number;
  totalIDACAfternoon: number;
  totalIDACNight: number;
  totalBakeNBite: number;
  totalTDY: number;
  totalLeave: number;
  totalDutyOff: number;
  totalDutyCount: number; // Sum of active security/taskforce/special duties
}

export interface ConflictAlert {
  id: string;
  airmanId: string;
  airmanName: string;
  date: string;
  severity: 'warning' | 'error';
  message: string;
  ruleType: string;
}

export type UserRole = 'ADMIN' | 'AIRMAN';

export interface PersonnelStatusItem {
  airman: Airman;
  dutyCode: DutyCategoryCode;
  idaShift?: IDAShift;
  disposalScope?: 'ALL' | 'PARADE' | 'PT';
  notes?: string;
  dutyName?: string;
  previousDutyName?: string;
  statusCategory: DutyCategoryCode | 'ON_PARADE' | 'ON_DUTY' | 'ON_LEAVE' | 'TDY' | 'DUTY_OFF' | 'BAKE_N_BITE' | 'PARADE' | 'DUTY' | 'LEAVE' | 'OFF';
}

export interface ActivityHistoryItem {
  id: string;
  timestamp: string;
  actionType: 'ASSIGN_DUTY' | 'ASSIGN_RANGE' | 'GRANT_LEAVE' | 'DELETE_ASSIGNMENT' | 'CLEAR_RANGE' | 'EDIT_DUTY' | 'IMPORT_PDF_ROSTER';
  airmanId: string;
  airmanName: string;
  airmanRank?: string;
  airmanTrade?: string;
  dutyCode: DutyCategoryCode;
  idaShift?: IDAShift;
  fromDate: string;
  toDate: string;
  notes?: string;
  previousAssignments?: Array<{ airmanId: string; date: string; dutyCode?: DutyCategoryCode; idaShift?: IDAShift; notes?: string }>;
}

export interface ParsedDutyAssignment {
  rawText: string;
  dutyCode: DutyCategoryCode;
  dutyName: string;
  idaShift?: IDAShift | null;
  matchedAirmanId: string | null;
  matchedAirmanName?: string;
  matchedAirmanRank?: Rank;
  matchedAirmanTrade?: string;
  matchedAirmanFlight?: FlightName;
  matchedAirmanBdNo?: string;
  confidence: number;
  isIgnored?: boolean;
}

export interface ParsedDateEntry {
  date: string;
  dayName: string;
  assignments: ParsedDutyAssignment[];
}

export interface DocumentAnalysisResult {
  documentTitle: string;
  detectedFlight: FlightName | 'Overall';
  year: number;
  month: number;
  totalDates: number;
  totalPages?: number;
  totalFiles?: number;
  dateRange: { start: string; end: string };
  dates: ParsedDateEntry[];
  totalAssignmentsCount: number;
  matchedCount: number;
  unmatchedCount: number;
}

export interface ParadeStateResponse {
  date: string;
  shift: ParadeShift;
  flight: FlightName | 'Overall';
  summary: {
    totalStrength: number;
    onParade: number;
    onDuty: number;
    onLeave: number;
    tdy: number;
  };
  flightBreakdown: Record<FlightName, {
    total: number;
    onParade: number;
    onDuty: number;
    onLeave: number;
    tdy: number;
  }>;
  personnelStatusList: PersonnelStatusItem[];
}

export type ThemePreference = 'dark' | 'light' | 'system';

export interface ImportHistoryBatch {
  id: string;
  timestamp: string;
  sourceDoc: string;
  dutyCount: number;
  datesCount: number;
  dates: string[];
  airmenNames?: string[];
  importedAssignments: Array<{
    airmanId: string;
    airmanName?: string;
    airmanRank?: string;
    airmanFlight?: FlightName;
    date: string;
    dutyCode: DutyCategoryCode;
    idaShift?: IDAShift;
    notes?: string;
  }>;
  previousAssignments: Array<{
    airmanId: string;
    date: string;
    dutyCode?: DutyCategoryCode;
    idaShift?: IDAShift;
    notes?: string;
  }>;
}

