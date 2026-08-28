import {
  Airman,
  DutyAssignment,
  FlightName,
  ParadeShift,
  ActivityHistoryItem,
  DutyCategoryCode,
  IDAShift,
  ImportHistoryBatch,
  ParadeStateResponse,
  AirmanDutyStats,
  ConflictAlert,
} from '../types';
import { INITIAL_AIRMEN } from '../data/initialAirmen';
import { DUTY_TYPES } from '../data/dutyTypes';
import { generateOfficialMonthAssignments } from '../data/officialJulyAugustData';
import { calculateDutyStats, detectConflicts, getDaysInMonth } from '../data/rosterGenerator';

export interface LocalStorageDB {
  airmen: Airman[];
  assignments: Record<string, DutyAssignment[]>; // monthKey YYYY-MM -> DutyAssignment[]
  activityHistory: ActivityHistoryItem[];
  adminPasscode: string;
  importHistory: ImportHistoryBatch[];
  lastUpdated: string;
}

const STORAGE_KEY = 'baf_155_uasu_v2_db';

function getDatesInRange(fromDateStr: string, toDateStr: string): string[] {
  const dates: string[] = [];
  const [fY, fM, fD] = fromDateStr.split('-').map(Number);
  const [tY, tM, tD] = toDateStr.split('-').map(Number);

  if (!fY || !fM || !fD || !tY || !tM || !tD) return dates;

  const current = new Date(Date.UTC(fY, fM - 1, fD));
  const end = new Date(Date.UTC(tY, tM - 1, tD));

  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function getYesterdayDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export class LocalDatabaseEngine {
  private db: LocalStorageDB;

  constructor() {
    this.db = this.loadFromStorage();
  }

  private loadFromStorage(): LocalStorageDB {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.airmen) && parsed.airmen.length > 0) {
            // Ensure any missing initial airmen are merged
            const airmenMap = new Map<string, Airman>();
            INITIAL_AIRMEN.forEach((a) => airmenMap.set(a.id, a));
            parsed.airmen.forEach((a: Airman) => {
              const init = airmenMap.get(a.id);
              airmenMap.set(a.id, init ? { ...init, ...a } : a);
            });

            const mergedAirmen = Array.from(airmenMap.values()).sort((a, b) => a.serNo - b.serNo);

            const db: LocalStorageDB = {
              airmen: mergedAirmen,
              assignments: parsed.assignments || {},
              activityHistory: parsed.activityHistory || [],
              adminPasscode: parsed.adminPasscode || '1124',
              importHistory: parsed.importHistory || [],
              lastUpdated: new Date().toISOString(),
            };

            // If no assignments exist, seed official months
            if (!db.assignments['2026-07']) {
              db.assignments['2026-07'] = generateOfficialMonthAssignments(2026, 7);
            }
            if (!db.assignments['2026-08']) {
              db.assignments['2026-08'] = generateOfficialMonthAssignments(2026, 8);
            }

            return db;
          }
        }
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using initial state:', err);
    }

    // Default fresh DB
    const initialDb: LocalStorageDB = {
      airmen: [...INITIAL_AIRMEN],
      assignments: {
        '2026-07': generateOfficialMonthAssignments(2026, 7),
        '2026-08': generateOfficialMonthAssignments(2026, 8),
      },
      activityHistory: [],
      adminPasscode: '1124',
      importHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    this.saveToStorage(initialDb, false);
    return initialDb;
  }

  private saveToStorage(dbToSave: LocalStorageDB = this.db, notify: boolean = true) {
    try {
      dbToSave.lastUpdated = new Date().toISOString();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbToSave));
      }
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    if (notify && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('baf_state_updated', { detail: { source: 'localDatabase' } }));
    }
  }

  private recordActivity(action: Omit<ActivityHistoryItem, 'id' | 'timestamp'>) {
    if (!this.db.activityHistory) {
      this.db.activityHistory = [];
    }
    const air = this.db.airmen.find((a) => a.id === action.airmanId);
    const item: ActivityHistoryItem = {
      ...action,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      airmanRank: air?.rank,
      airmanTrade: air?.trade,
    };
    this.db.activityHistory.unshift(item);
    if (this.db.activityHistory.length > 100) {
      this.db.activityHistory = this.db.activityHistory.slice(0, 100);
    }
  }

  // --- AIRMEN CRUD ---
  public getAirmen(filters?: { flight?: string; rank?: string; search?: string }): Airman[] {
    let list = [...this.db.airmen];
    if (filters?.flight && filters.flight !== 'Overall') {
      list = list.filter((a) => a.flightName === filters.flight);
    }
    if (filters?.rank && filters.rank !== 'All') {
      list = list.filter((a) => a.rank === filters.rank);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.bdNo.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.trade.toLowerCase().includes(q) ||
          a.addressBlock.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public addAirman(data: Partial<Airman>): Airman {
    const newSerNo = this.db.airmen.length > 0 ? Math.max(...this.db.airmen.map((a) => a.serNo)) + 1 : 1;
    const id = `airman-${Date.now()}`;
    const newAirman: Airman = {
      id,
      serNo: newSerNo,
      code: data.code || `${data.rank || 'LAC'}-${(data.name || 'AIR').slice(0, 3).toUpperCase()}`,
      bdNo: data.bdNo || `BD/${Date.now().toString().slice(-6)}`,
      rank: data.rank || 'LAC',
      name: data.name || 'Airman',
      trade: data.trade || 'General Tech',
      addressBlock: data.addressBlock || 'Airmen Mess',
      mobileNo: data.mobileNo || '01700000000',
      flightName: (data.flightName as FlightName) || 'Admin',
      remarks: data.remarks || 'Newly Enlisted',
      active: true,
    };

    this.db.airmen.push(newAirman);
    this.saveToStorage();
    return newAirman;
  }

  public updateAirman(id: string, data: Partial<Airman>): Airman | null {
    const idx = this.db.airmen.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.db.airmen[idx] = {
      ...this.db.airmen[idx],
      ...data,
      id,
    };
    this.saveToStorage();
    return this.db.airmen[idx];
  }

  public deleteAirman(id: string): boolean {
    const initialCount = this.db.airmen.length;
    this.db.airmen = this.db.airmen.filter((a) => a.id !== id);
    if (this.db.airmen.length === initialCount) return false;

    // Clean assignments
    if (this.db.assignments) {
      Object.keys(this.db.assignments).forEach((monthKey) => {
        if (Array.isArray(this.db.assignments[monthKey])) {
          this.db.assignments[monthKey] = this.db.assignments[monthKey].filter((ass) => ass.airmanId !== id);
        }
      });
    }

    this.saveToStorage();
    return true;
  }

  // --- ROSTER & ASSIGNMENTS ---
  public getRoster(monthKey?: string): { monthKey: string; assignments: DutyAssignment[] } {
    const today = new Date();
    const defaultMonthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const targetMonth = monthKey || defaultMonthKey;
    const assignments = this.db.assignments[targetMonth] || [];
    return { monthKey: targetMonth, assignments };
  }

  public getRosterYear(year?: number): { year: number; assignments: DutyAssignment[] } {
    const targetYear = year || new Date().getFullYear();
    const prefix = `${targetYear}-`;
    const assignments: DutyAssignment[] = [];
    Object.keys(this.db.assignments).forEach((mKey) => {
      if (mKey.startsWith(prefix)) {
        assignments.push(...(this.db.assignments[mKey] || []));
      }
    });
    return { year: targetYear, assignments };
  }

  public assignDuty(monthKey: string, assignment: DutyAssignment): DutyAssignment {
    if (!this.db.assignments[monthKey]) {
      this.db.assignments[monthKey] = [];
    }
    const list = this.db.assignments[monthKey];
    let index = -1;

    if (assignment.dutyCode === 'IDAC' || assignment.dutyCode === 'IDA') {
      if (assignment.idaShift === 'Night') {
        index = list.findIndex(
          (a) => a.airmanId === assignment.airmanId && a.date === assignment.date && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === 'Night'
        );
      } else {
        index = list.findIndex(
          (a) => a.airmanId === assignment.airmanId && a.date === assignment.date && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift !== 'Night'
        );
      }
    } else {
      index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date && a.dutyCode === assignment.dutyCode);
      if (index < 0) {
        index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date);
      }
    }

    const prevAssignment = index >= 0 ? { ...list[index] } : null;
    const newAss: DutyAssignment = {
      ...assignment,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = newAss;
    } else {
      list.push(newAss);
    }

    const air = this.db.airmen.find((a) => a.id === assignment.airmanId);
    this.recordActivity({
      actionType: assignment.dutyCode === 'LEAVE' ? 'GRANT_LEAVE' : 'ASSIGN_DUTY',
      airmanId: assignment.airmanId,
      airmanName: air ? `${air.rank} ${air.name}` : assignment.airmanId,
      dutyCode: assignment.dutyCode,
      idaShift: assignment.idaShift,
      fromDate: assignment.date,
      toDate: assignment.date,
      notes: assignment.notes,
      previousAssignments: [
        {
          airmanId: assignment.airmanId,
          date: assignment.date,
          dutyCode: prevAssignment?.dutyCode,
          idaShift: prevAssignment?.idaShift,
          notes: prevAssignment?.notes,
        },
      ],
    });

    this.saveToStorage();
    return newAss;
  }

  public assignRange(params: {
    airmanId: string;
    dutyCode: DutyCategoryCode;
    idaShift?: IDAShift;
    fromDate: string;
    toDate: string;
    notes?: string;
    proxyForFlight?: FlightName;
    replaceAirmanId?: string;
    disposalScope?: 'ALL' | 'PARADE' | 'PT';
  }): { count: number; assignedDates: string[] } {
    const { airmanId, dutyCode, idaShift, fromDate, toDate, notes, proxyForFlight, replaceAirmanId, disposalScope } = params;
    const assignedDates = getDatesInRange(fromDate, toDate);
    const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

    for (const dateStr of assignedDates) {
      const monthKey = dateStr.slice(0, 7);
      if (!this.db.assignments[monthKey]) {
        this.db.assignments[monthKey] = [];
      }

      if (replaceAirmanId && replaceAirmanId !== airmanId) {
        const oldIndex = this.db.assignments[monthKey].findIndex((a) => a.airmanId === replaceAirmanId && a.date === dateStr);
        if (oldIndex >= 0) {
          const oldItem = this.db.assignments[monthKey][oldIndex];
          prevStates.push({
            airmanId: replaceAirmanId,
            date: dateStr,
            dutyCode: oldItem.dutyCode,
            idaShift: oldItem.idaShift,
            notes: oldItem.notes,
          });
          this.db.assignments[monthKey].splice(oldIndex, 1);
        }
      }

      const list = this.db.assignments[monthKey];
      let index = -1;
      if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
        if (idaShift === 'Night') {
          index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === 'Night');
        } else {
          index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift !== 'Night');
        }
      } else {
        index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr && a.dutyCode === dutyCode);
        if (index < 0) {
          index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr);
        }
      }

      if (index >= 0) {
        prevStates.push({ airmanId, date: dateStr, dutyCode: list[index].dutyCode, idaShift: list[index].idaShift, notes: list[index].notes });
      } else {
        prevStates.push({ airmanId, date: dateStr, dutyCode: undefined });
      }

      const assignment: DutyAssignment = {
        airmanId,
        date: dateStr,
        dutyCode,
        idaShift,
        proxyForFlight,
        disposalScope: disposalScope || 'ALL',
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        list[index] = assignment;
      } else {
        list.push(assignment);
      }
    }

    const air = this.db.airmen.find((a) => a.id === airmanId);
    this.recordActivity({
      actionType: dutyCode === 'LEAVE' ? 'GRANT_LEAVE' : 'ASSIGN_RANGE',
      airmanId,
      airmanName: air ? `${air.rank} ${air.name}` : airmanId,
      dutyCode,
      idaShift,
      fromDate,
      toDate,
      notes,
      previousAssignments: prevStates,
    });

    this.saveToStorage();
    return { count: assignedDates.length, assignedDates };
  }

  public batchAssign(params: {
    fromDate: string;
    toDate: string;
    assignments: Array<{
      airmanId: string;
      dutyCode: DutyCategoryCode;
      idaShift?: IDAShift;
      proxyForFlight?: FlightName;
      notes?: string;
      disposalScope?: 'ALL' | 'PARADE' | 'PT';
    }>;
    removedAirmanIds?: string[];
  }): { count: number; assignedDates: string[] } {
    const { fromDate, toDate, assignments, removedAirmanIds } = params;
    const assignedDates = getDatesInRange(fromDate, toDate);
    const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

    // Remove unassigned
    if (Array.isArray(removedAirmanIds) && removedAirmanIds.length > 0) {
      for (const dateStr of assignedDates) {
        const monthKey = dateStr.slice(0, 7);
        if (this.db.assignments[monthKey]) {
          for (const remId of removedAirmanIds) {
            const found = this.db.assignments[monthKey].find((a) => a.airmanId === remId && a.date === dateStr);
            if (found) {
              prevStates.push({ airmanId: remId, date: dateStr, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes });
            }
            this.db.assignments[monthKey] = this.db.assignments[monthKey].filter(
              (a) => !(a.airmanId === remId && a.date === dateStr)
            );
          }
        }
      }
    }

    // Apply assignments
    for (const item of assignments) {
      const { airmanId, dutyCode, idaShift, proxyForFlight, notes, disposalScope } = item;
      if (!airmanId || !dutyCode) continue;

      for (const dateStr of assignedDates) {
        const monthKey = dateStr.slice(0, 7);
        if (!this.db.assignments[monthKey]) {
          this.db.assignments[monthKey] = [];
        }

        const list = this.db.assignments[monthKey];
        const index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr);

        if (index >= 0) {
          prevStates.push({ airmanId, date: dateStr, dutyCode: list[index].dutyCode, idaShift: list[index].idaShift, notes: list[index].notes });
        } else {
          prevStates.push({ airmanId, date: dateStr, dutyCode: undefined });
        }

        const newAssignment: DutyAssignment = {
          airmanId,
          date: dateStr,
          dutyCode,
          idaShift,
          proxyForFlight,
          disposalScope: disposalScope || 'ALL',
          notes: notes || '',
          updatedAt: new Date().toISOString(),
        };

        if (index >= 0) {
          list[index] = newAssignment;
        } else {
          list.push(newAssignment);
        }
      }
    }

    this.recordActivity({
      actionType: 'ASSIGN_DUTY',
      airmanId: 'BATCH_ASSIGN',
      airmanName: `${assignments.length} Duties Assigned`,
      dutyCode: 'GD',
      fromDate,
      toDate,
      notes: `Batch assigned ${assignments.length} duties across ${assignedDates.length} date(s)`,
      previousAssignments: prevStates,
    });

    this.saveToStorage();
    return { count: assignments.length, assignedDates };
  }

  public deleteAssignment(airmanId: string, date: string): boolean {
    const monthKey = date.slice(0, 7);
    if (this.db.assignments[monthKey]) {
      const found = this.db.assignments[monthKey].find((a) => a.airmanId === airmanId && a.date === date);
      this.db.assignments[monthKey] = this.db.assignments[monthKey].filter(
        (a) => !(a.airmanId === airmanId && a.date === date)
      );

      const air = this.db.airmen.find((a) => a.id === airmanId);
      this.recordActivity({
        actionType: 'DELETE_ASSIGNMENT',
        airmanId,
        airmanName: air ? `${air.rank} ${air.name}` : airmanId,
        dutyCode: found?.dutyCode || 'ON_PARADE',
        fromDate: date,
        toDate: date,
        notes: 'Deleted assignment',
        previousAssignments: found ? [{ airmanId, date, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes }] : [],
      });

      this.saveToStorage();
      return true;
    }
    return false;
  }

  public deleteRange(params: { airmanId: string; fromDate: string; toDate: string; dutyCode?: string; idaShift?: string }): number {
    const { airmanId, fromDate, toDate, dutyCode, idaShift } = params;
    const datesToDelete = getDatesInRange(fromDate, toDate);
    let deletedCount = 0;
    const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

    for (const dateStr of datesToDelete) {
      const monthKey = dateStr.slice(0, 7);
      if (this.db.assignments[monthKey]) {
        const matchFn = (a: DutyAssignment) => {
          if (a.airmanId !== airmanId || a.date !== dateStr) return false;
          if (dutyCode) {
            if (dutyCode === 'AIRFIELD_DUTY' || dutyCode === 'AIRPORT') {
              if (a.dutyCode !== 'AIRFIELD_DUTY' && a.dutyCode !== 'AIRPORT') return false;
            } else if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
              if (a.dutyCode !== 'IDAC' && a.dutyCode !== 'IDA') return false;
              if (idaShift && a.idaShift !== idaShift) return false;
            } else if (a.dutyCode !== dutyCode) {
              return false;
            }
          }
          return true;
        };

        const found = this.db.assignments[monthKey].find(matchFn);
        if (found) {
          prevStates.push({ airmanId, date: dateStr, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes });
        }
        const initialLen = this.db.assignments[monthKey].length;
        this.db.assignments[monthKey] = this.db.assignments[monthKey].filter((a) => !matchFn(a));
        deletedCount += initialLen - this.db.assignments[monthKey].length;
      }
    }

    const air = this.db.airmen.find((a) => a.id === airmanId);
    this.recordActivity({
      actionType: 'CLEAR_RANGE',
      airmanId,
      airmanName: air ? `${air.rank} ${air.name}` : airmanId,
      dutyCode: 'ON_PARADE',
      fromDate,
      toDate,
      notes: `Cleared ${deletedCount} day(s)`,
      previousAssignments: prevStates,
    });

    this.saveToStorage();
    return deletedCount;
  }

  // --- PARADE STATE & PT STATE ---
  public getParadeState(params: {
    date?: string;
    shift?: ParadeShift;
    flight?: FlightName | 'Overall';
    stateType?: string;
  }): any {
    const today = new Date().toISOString().split('T')[0];
    const date = params.date || today;
    const shift = params.shift || 'Morning';
    const selectedFlight = params.flight || 'Overall';
    const stateType = (params.stateType || 'PARADE').toUpperCase();
    const isPT = stateType === 'PT';

    const monthKey = date.slice(0, 7);
    const monthAssignments = this.db.assignments[monthKey] || [];
    const dateAssignments = monthAssignments.filter((a) => a.date === date);

    const assignmentMap = new Map<string, DutyAssignment>();
    dateAssignments.forEach((a) => assignmentMap.set(a.airmanId, a));

    // Yesterday's assignments for auto duty off calculation
    const yestStr = getYesterdayDateStr(date);
    const yestMonthKey = yestStr.slice(0, 7);
    const yestAssignments = (this.db.assignments[yestMonthKey] || []).filter((a) => a.date === yestStr);
    const yestMap = new Map<string, DutyAssignment>();
    yestAssignments.forEach((a) => yestMap.set(a.airmanId, a));

    const filteredAirmen = selectedFlight === 'Overall' ? this.db.airmen : this.db.airmen.filter((a) => a.flightName === selectedFlight);

    let onParade = 0;
    let onDuty = 0;
    let onLeave = 0;
    let tdy = 0;
    let otherOff = 0;
    let bakeNBite = 0;

    const resolveEffectiveAssignment = (airmanId: string) => {
      const ass = assignmentMap.get(airmanId);
      const scope = ass?.disposalScope || 'ALL';
      const isApplicable = scope === 'ALL' || (isPT && scope === 'PT') || (!isPT && scope === 'PARADE');

      if (ass && isApplicable) {
        let dutyName: string = String(ass.dutyCode);
        let statusCategory: string = 'DUTY';
        let previousDutyName: string | undefined = undefined;

        const codeStr = String(ass.dutyCode);
        if (codeStr === 'GD') dutyName = 'Base Security Duty';
        else if (codeStr === 'BTF') dutyName = 'Base Taskforce Duty';
        else if (codeStr === 'NTF') dutyName = 'Najirpara Taskforce Duty';
        else if (codeStr === 'HALISHAHAR') dutyName = 'Halishahar Duty';
        else if (codeStr === 'AIRPORT' || codeStr === 'AIRFIELD' || codeStr === 'AIRFIELD_DUTY') dutyName = 'Airfield Duty';
        else if (codeStr === 'IDAC' || codeStr === 'IDA') {
          const s = ass.idaShift || 'Morning';
          dutyName = `IDAC Duty (${s})`;

          if (isPT) {
            statusCategory = 'DUTY';
          } else {
            if (s === 'Night' && shift === 'Morning') {
              const yestAss = yestMap.get(airmanId);
              const hadDutyYesterday =
                yestAss &&
                (['GD', 'BTF', 'NTF', 'AIRPORT', 'HALISHAHAR'].includes(yestAss.dutyCode) ||
                  ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night'));
              if (hadDutyYesterday) {
                statusCategory = 'OFF';
                previousDutyName = (yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') ? 'IDAC Nt Off' : `${yestAss.dutyCode} Off`;
                dutyName = previousDutyName;
              } else {
                statusCategory = 'PARADE';
                dutyName = 'On Parade';
              }
            } else {
              statusCategory = 'DUTY';
            }
          }
        } else if (codeStr === 'BAKE_N_BITE') {
          dutyName = 'Bake N Bite';
          statusCategory = 'BAKE_N_BITE';
        } else if (codeStr === 'LEAVE') {
          dutyName = ass.notes?.includes('Annual') || ass.notes?.includes('AL') ? 'Annual Leave (AL)' : 'Casual Leave (CL)';
          statusCategory = 'LEAVE';
        } else if (codeStr === 'TDY') {
          dutyName = 'TDY / Attachment';
          statusCategory = 'TDY';
        } else if (codeStr === 'DUTY_OFF') {
          if (isPT) {
            return {
              dutyCode: 'ON_PARADE',
              dutyName: 'On PT',
              notes: '',
              statusCategory: 'PARADE',
              disposalScope: scope,
            };
          }

          const yestAss = yestMap.get(airmanId);
          let offShort = 'GD Off';
          if (yestAss) {
            const yestCodeStr = String(yestAss.dutyCode);
            if (yestCodeStr === 'GD') offShort = 'GD Off';
            else if (yestCodeStr === 'BTF') offShort = 'BTF Off';
            else if (yestCodeStr === 'NTF') offShort = 'NTF Off';
            else if (yestCodeStr === 'AIRPORT' || yestCodeStr === 'AIRFIELD' || yestCodeStr === 'AIRFIELD_DUTY') offShort = 'Airport Off';
            else if (yestCodeStr === 'HALISHAHAR') offShort = 'Halishahar Off';
            else if ((yestCodeStr === 'IDAC' || yestCodeStr === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
            else if (yestAss.notes?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
            else if (yestCodeStr === 'DUTY_OFF') offShort = yestAss.previousDutyName || 'GD Off';
            else offShort = `${yestAss.dutyCode} Off`;
          } else if (ass.notes && !ass.notes.toLowerCase().includes('imported')) {
            offShort = ass.notes;
          }

          offShort = offShort.replace(/DUTY_OFF/g, 'Duty').replace(/Off Off/g, 'Off');
          if (!offShort.toLowerCase().endsWith('off')) offShort = `${offShort} Off`;

          previousDutyName = offShort;
          dutyName = offShort;
          statusCategory = 'OFF';
        } else if (codeStr === 'ON_PARADE') {
          dutyName = isPT ? 'On PT' : 'On Parade';
          statusCategory = 'PARADE';
        } else {
          dutyName = codeStr;
          statusCategory = 'OFF';
        }

        const safeNotes = (ass.notes || '').toLowerCase().includes('imported') ? '' : ass.notes || '';
        return {
          dutyCode: ass.dutyCode,
          idaShift: ass.idaShift,
          proxyForFlight: ass.proxyForFlight,
          disposalScope: scope,
          notes: safeNotes,
          dutyName,
          previousDutyName,
          statusCategory,
        };
      }

      if (!isPT) {
        const yestAss = yestMap.get(airmanId);
        if (yestAss) {
          let offShort = 'Duty Off';
          if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
          else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
          else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
          else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
          else if (yestAss.dutyCode === 'HALISHAHAR') offShort = 'Halishahar Off';
          else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
          else if (yestAss.dutyCode === 'DUTY_OFF') offShort = yestAss.previousDutyName || 'Duty Off';
          else offShort = `${yestAss.dutyCode} Off`;

          const isHeavy =
            ['GD', 'BTF', 'NTF', 'AIRPORT', 'HALISHAHAR', 'DUTY_OFF'].includes(yestAss.dutyCode) ||
            ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night');

          if (isHeavy) {
            return {
              dutyCode: 'DUTY_OFF',
              dutyName: offShort,
              previousDutyName: offShort,
              proxyForFlight: yestAss.proxyForFlight,
              notes: offShort,
              statusCategory: 'OFF',
            };
          }
        }
      }

      return {
        dutyCode: 'ON_PARADE',
        dutyName: isPT ? 'On PT' : 'On Parade',
        notes: '',
        statusCategory: 'PARADE',
      };
    };

    const personnelStatusList = filteredAirmen.map((airman) => {
      const eff = resolveEffectiveAssignment(airman.id);
      const dutyCode = eff.dutyCode;
      const idaShift = eff.idaShift;
      const proxyForFlight = eff.proxyForFlight;
      let notes = eff.notes;
      const dutyName = eff.dutyName;
      const previousDutyName = eff.previousDutyName;
      const statusCategory = eff.statusCategory;

      if (dutyCode === 'BAKE_N_BITE' || statusCategory === 'BAKE_N_BITE') {
        bakeNBite++;
      } else if (statusCategory === 'LEAVE' || dutyCode === 'LEAVE') {
        onLeave++;
      } else if (statusCategory === 'TDY' || ['TDY', 'ATT', 'DETT'].includes(dutyCode)) {
        tdy++;
      } else if (statusCategory === 'OFF' || dutyCode === 'DUTY_OFF') {
        otherOff++;
      } else if (statusCategory === 'DUTY') {
        onDuty++;
      } else if (statusCategory === 'PARADE' || dutyCode === 'ON_PARADE') {
        onParade++;
      } else {
        otherOff++;
      }

      return {
        airman,
        dutyCode,
        idaShift,
        proxyForFlight,
        statusCategory,
        notes,
        dutyName,
        previousDutyName,
      };
    });

    const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
    const flightBreakdown = {} as Record<FlightName, any>;

    flights.forEach((fl) => {
      const flAirmen = this.db.airmen.filter((a) => a.flightName === fl);
      let flParade = 0;
      let flDuty = 0;
      let flLeave = 0;
      let flTdy = 0;
      let flOff = 0;
      let flBakeNBite = 0;

      flAirmen.forEach((a) => {
        const eff = resolveEffectiveAssignment(a.id);
        if (eff.dutyCode === 'BAKE_N_BITE' || eff.statusCategory === 'BAKE_N_BITE') flBakeNBite++;
        else if (eff.statusCategory === 'LEAVE' || eff.dutyCode === 'LEAVE') flLeave++;
        else if (eff.statusCategory === 'TDY' || ['TDY', 'ATT', 'DETT'].includes(eff.dutyCode)) flTdy++;
        else if (eff.statusCategory === 'OFF' || eff.dutyCode === 'DUTY_OFF') flOff++;
        else if (eff.statusCategory === 'DUTY') flDuty++;
        else if (eff.statusCategory === 'PARADE' || eff.dutyCode === 'ON_PARADE') flParade++;
        else flOff++;
      });

      flightBreakdown[fl] = {
        total: flAirmen.length,
        onParade: flParade,
        onDuty: flDuty,
        onLeave: flLeave,
        tdy: flTdy,
        otherOff: flOff,
        bakeNBite: flBakeNBite,
      };
    });

    return {
      date,
      shift,
      flight: selectedFlight,
      summary: {
        totalStrength: filteredAirmen.length,
        onParade,
        onDuty,
        onLeave,
        tdy,
        otherOff,
        bakeNBite,
      },
      flightBreakdown,
      personnelStatusList,
    };
  }

  // --- ANALYTICS ---
  public getAnalytics(monthKey?: string): any {
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const targetMonth = monthKey || defaultMonth;
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const assignments = this.db.assignments[targetMonth] || [];
    const airmenStats = calculateDutyStats(this.db.airmen, assignments, year, month);
    const conflictAlerts = detectConflicts(this.db.airmen, assignments);

    return {
      month: targetMonth,
      totalAirmen: this.db.airmen.length,
      airmenStats,
      conflictAlerts,
    };
  }

  // --- HISTORY & UTILS ---
  public getHistory(): ActivityHistoryItem[] {
    return this.db.activityHistory || [];
  }

  public undoHistory(historyId: string): boolean {
    const idx = (this.db.activityHistory || []).findIndex((h) => h.id === historyId);
    if (idx === -1) return false;

    const item = this.db.activityHistory[idx];
    if (item.previousAssignments && item.previousAssignments.length > 0) {
      for (const prev of item.previousAssignments) {
        const mKey = prev.date.slice(0, 7);
        if (!this.db.assignments[mKey]) this.db.assignments[mKey] = [];
        const list = this.db.assignments[mKey];
        const existIdx = list.findIndex((a) => a.airmanId === prev.airmanId && a.date === prev.date);

        if (!prev.dutyCode || prev.dutyCode === 'ON_PARADE') {
          if (existIdx >= 0) list.splice(existIdx, 1);
        } else {
          const restored: DutyAssignment = {
            airmanId: prev.airmanId,
            date: prev.date,
            dutyCode: prev.dutyCode,
            idaShift: prev.idaShift,
            notes: prev.notes || '',
            updatedAt: new Date().toISOString(),
          };
          if (existIdx >= 0) list[existIdx] = restored;
          else list.push(restored);
        }
      }
    }

    this.db.activityHistory.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public verifyPasscode(code: string): boolean {
    return (code || '').trim() === (this.db.adminPasscode || '1124');
  }

  public changePasscode(current: string, newCode: string): boolean {
    if (this.verifyPasscode(current) && newCode && newCode.length === 4) {
      this.db.adminPasscode = newCode;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public exportDatabase(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      unit: '155 UASU, BAF BASE ZHR',
      version: '2.0',
      airmen: this.db.airmen,
      assignments: this.db.assignments,
      activityHistory: this.db.activityHistory,
      adminPasscode: this.db.adminPasscode,
      importHistory: this.db.importHistory,
    }, null, 2);
  }

  public restoreDatabase(uploadedData: any): boolean {
    const airmen = uploadedData.airmen || uploadedData.database?.airmen;
    const assignments = uploadedData.assignments || uploadedData.database?.assignments;
    if (airmen && Array.isArray(airmen)) {
      this.db.airmen = airmen;
      if (assignments && typeof assignments === 'object') {
        this.db.assignments = assignments;
      }
      if (Array.isArray(uploadedData.activityHistory)) {
        this.db.activityHistory = uploadedData.activityHistory;
      }
      if (uploadedData.adminPasscode) {
        this.db.adminPasscode = uploadedData.adminPasscode;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }
}

// Global Singleton Instance
export const localDb = new LocalDatabaseEngine();
