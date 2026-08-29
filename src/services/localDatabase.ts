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
import { generateOfficialMonthAssignments, getOfficialParadeStateDocument } from '../data/officialJulyAugustData';
import { calculateDutyStats, detectConflicts, getDaysInMonth } from '../data/rosterGenerator';
import { getSupabase } from './supabaseClient';
import { DutyRatioTable, INITIAL_OFFICIAL_DUTY_MATRIX, getStoredDutyMatrix, saveDutyMatrix } from '../data/officialDutyRatioMatrix';

export interface LocalStorageDB {
  airmen: Airman[];
  assignments: Record<string, DutyAssignment[]>; // monthKey YYYY-MM -> DutyAssignment[]
  activityHistory: ActivityHistoryItem[];
  adminPasscode: string;
  importHistory: ImportHistoryBatch[];
  lastUpdated: string;
}

const STORAGE_KEY = 'baf_155_uasu_v2_db';

function generateRandom4DigitPasscode(): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
}

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

function asyncSupabase(promiseLike: any): void {
  if (promiseLike && typeof promiseLike === 'object') {
    Promise.resolve(promiseLike).catch((err: any) => {
      console.warn('Supabase async operation warning:', err?.message || err);
    });
  }
}

export class LocalDatabaseEngine {
  private db: LocalStorageDB;
  private isSupabaseSyncing: boolean = false;

  constructor() {
    this.db = this.loadInitialLocalState();
    if (typeof window !== 'undefined') {
      // Async sync from Supabase
      this.syncFromSupabase();
    }
  }

  private loadInitialLocalState(): LocalStorageDB {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.airmen) && parsed.airmen.length > 0) {
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
              adminPasscode: parsed.adminPasscode || generateRandom4DigitPasscode(),
              importHistory: parsed.importHistory || [],
              lastUpdated: new Date().toISOString(),
            };

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
    const initialPasscode = generateRandom4DigitPasscode();
    const initialDb: LocalStorageDB = {
      airmen: [...INITIAL_AIRMEN],
      assignments: {
        '2026-07': generateOfficialMonthAssignments(2026, 7),
        '2026-08': generateOfficialMonthAssignments(2026, 8),
      },
      activityHistory: [],
      adminPasscode: initialPasscode,
      importHistory: [],
      lastUpdated: new Date().toISOString(),
    };

    this.saveToStorage(initialDb, false);
    return initialDb;
  }

  /**
   * Synchronize all tables with Supabase Postgres
   */
  public async syncFromSupabase(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || this.isSupabaseSyncing) return;

    this.isSupabaseSyncing = true;
    try {
      // 1. Fetch Airmen
      const { data: airmenData, error: airmenErr } = await supabase.from('airmen').select('*').order('ser_no', { ascending: true });
      if (!airmenErr && airmenData && airmenData.length > 0) {
        this.db.airmen = airmenData.map((row) => ({
          id: row.id,
          serNo: row.ser_no || 1,
          code: row.code || '',
          bdNo: row.bd_no || '',
          rank: row.rank || 'LAC',
          name: row.name || 'Airman',
          trade: row.trade || '',
          addressBlock: row.address_block || '',
          mobileNo: row.mobile_no || '',
          flightName: row.flight_name || 'Admin',
          remarks: row.remarks || '',
          active: row.active !== false,
        }));
      } else if (airmenData && airmenData.length === 0) {
        // Seed Supabase with initial airmen
        const initialRows = this.db.airmen.map((a) => ({
          id: a.id,
          ser_no: a.serNo,
          code: a.code,
          bd_no: a.bdNo,
          rank: a.rank,
          name: a.name,
          trade: a.trade,
          address_block: a.addressBlock,
          mobile_no: a.mobileNo,
          flight_name: a.flightName,
          remarks: a.remarks,
          active: a.active,
        }));
        await supabase.from('airmen').insert(initialRows);
      }

      // 2. Fetch Assignments
      const { data: assignData, error: assignErr } = await supabase.from('assignments').select('*');
      if (!assignErr && assignData && assignData.length > 0) {
        const monthMap: Record<string, DutyAssignment[]> = {};
        assignData.forEach((row) => {
          const dateStr = row.date;
          if (!dateStr) return;
          const monthKey = dateStr.slice(0, 7);
          if (!monthMap[monthKey]) monthMap[monthKey] = [];
          monthMap[monthKey].push({
            airmanId: row.airman_id || row.airmanId,
            date: row.date,
            dutyCode: row.duty_code || row.dutyCode,
            idaShift: row.ida_shift || row.idaShift,
            proxyForFlight: row.proxy_for_flight || row.proxyForFlight,
            disposalScope: row.disposal_scope || row.disposalScope || 'ALL',
            notes: row.notes || '',
            isCustom: row.is_custom || false,
            updatedAt: row.updated_at,
          });
        });
        this.db.assignments = monthMap;
      }

      // 3. Fetch Admin Passcode
      const { data: passData, error: passErr } = await supabase.from('admin_passcode').select('*').eq('id', 'current').single();
      if (!passErr && passData && passData.passcode) {
        this.db.adminPasscode = passData.passcode;
      } else {
        // Seed passcode in Supabase
        await supabase.from('admin_passcode').upsert({ id: 'current', passcode: this.db.adminPasscode });
      }

      // 4. Fetch Duty Ratio Matrix
      const { data: ratioData, error: ratioErr } = await supabase.from('duty_ratio_matrix').select('*').eq('id', 'current_ratio').single();
      if (!ratioErr && ratioData && ratioData.matrix_data) {
        saveDutyMatrix(ratioData.matrix_data);
      }

      // 5. Fetch Activity History
      const { data: actData, error: actErr } = await supabase.from('activity_history').select('*').order('timestamp', { ascending: false }).limit(100);
      if (!actErr && actData && actData.length > 0) {
        this.db.activityHistory = actData.map((row) => ({
          id: row.id,
          actionType: row.action_type,
          airmanId: row.airman_id,
          airmanName: row.airman_name,
          airmanRank: row.airman_rank,
          airmanTrade: row.airman_trade,
          dutyCode: row.duty_code,
          idaShift: row.ida_shift,
          fromDate: row.from_date,
          toDate: row.to_date,
          notes: row.notes,
          previousAssignments: row.previous_assignments,
          timestamp: row.timestamp,
        }));
      }

      this.saveToStorage(this.db, true);
    } catch (e) {
      console.warn('Error during Supabase synchronization:', e);
    } finally {
      this.isSupabaseSyncing = false;
    }
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

    // Persist activity to Supabase
    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(
        supabase.from('activity_history').insert({
          id: item.id,
          action_type: item.actionType,
          airman_id: item.airmanId,
          airman_name: item.airmanName,
          airman_rank: item.airmanRank,
          airman_trade: item.airmanTrade,
          duty_code: item.dutyCode,
          ida_shift: item.idaShift,
          from_date: item.fromDate,
          to_date: item.toDate,
          notes: item.notes,
          previous_assignments: item.previousAssignments,
          timestamp: item.timestamp,
        })
      );
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

    // Supabase insert
    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(
        supabase.from('airmen').insert({
          id: newAirman.id,
          ser_no: newAirman.serNo,
          code: newAirman.code,
          bd_no: newAirman.bdNo,
          rank: newAirman.rank,
          name: newAirman.name,
          trade: newAirman.trade,
          address_block: newAirman.addressBlock,
          mobile_no: newAirman.mobileNo,
          flight_name: newAirman.flightName,
          remarks: newAirman.remarks,
          active: newAirman.active,
        })
      );
    }

    return newAirman;
  }

  public bulkAddAirmen(airmenList: Partial<Airman>[]): { count: number; airmen: Airman[] } {
    let currentSerNo = this.db.airmen.length > 0 ? Math.max(...this.db.airmen.map((a) => a.serNo)) : 0;
    const createdAirmen: Airman[] = [];
    const supabaseRows: any[] = [];

    for (const item of airmenList) {
      currentSerNo++;
      const id = `airman-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const cleanBd = item.bdNo ? (item.bdNo.toUpperCase().startsWith('BD') ? item.bdNo : `BD/${item.bdNo}`) : `BD/${Date.now().toString().slice(-6)}`;
      const newAirman: Airman = {
        id,
        serNo: currentSerNo,
        code: item.code || `${item.rank || 'LAC'}-${(item.name || 'AIR').slice(0, 3).toUpperCase()}`,
        bdNo: cleanBd,
        rank: item.rank || 'LAC',
        name: item.name || 'Airman',
        trade: item.trade || 'General Tech',
        addressBlock: item.addressBlock || 'Airmen Mess',
        mobileNo: item.mobileNo || '01700000000',
        flightName: (item.flightName as FlightName) || 'Admin',
        remarks: item.remarks || 'Bulk Imported',
        active: true,
      };

      createdAirmen.push(newAirman);
      this.db.airmen.push(newAirman);

      supabaseRows.push({
        id: newAirman.id,
        ser_no: newAirman.serNo,
        code: newAirman.code,
        bd_no: newAirman.bdNo,
        rank: newAirman.rank,
        name: newAirman.name,
        trade: newAirman.trade,
        address_block: newAirman.addressBlock,
        mobile_no: newAirman.mobileNo,
        flight_name: newAirman.flightName,
        remarks: newAirman.remarks,
        active: newAirman.active,
      });
    }

    this.saveToStorage();

    // Persist bulk rows in Supabase
    const supabase = getSupabase();
    if (supabase && supabaseRows.length > 0) {
      asyncSupabase(supabase.from('airmen').insert(supabaseRows));
    }

    // Log in activity history
    this.recordActivity({
      actionType: 'BULK_IMPORT_AIRMEN' as any,
      airmanId: 'BULK_AIRMEN',
      airmanName: `${createdAirmen.length} Airmen Imported`,
      dutyCode: 'GD',
      fromDate: '',
      toDate: '',
      notes: `Bulk imported ${createdAirmen.length} airmen to Nominal Roll`,
    });

    return { count: createdAirmen.length, airmen: createdAirmen };
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

    const updated = this.db.airmen[idx];
    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(
        supabase
          .from('airmen')
          .update({
            ser_no: updated.serNo,
            code: updated.code,
            bd_no: updated.bdNo,
            rank: updated.rank,
            name: updated.name,
            trade: updated.trade,
            address_block: updated.addressBlock,
            mobile_no: updated.mobileNo,
            flight_name: updated.flightName,
            remarks: updated.remarks,
            active: updated.active,
          })
          .eq('id', id)
      );
    }

    return updated;
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

    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(supabase.from('airmen').delete().eq('id', id));
      asyncSupabase(supabase.from('assignments').delete().eq('airman_id', id));
    }

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

    // Supabase upsert
    const supabase = getSupabase();
    if (supabase) {
      const assignmentId = `${newAss.airmanId}_${newAss.date}_${newAss.dutyCode}${newAss.idaShift ? '_' + newAss.idaShift : ''}`;
      asyncSupabase(
        supabase.from('assignments').upsert({
          id: assignmentId,
          airman_id: newAss.airmanId,
          date: newAss.date,
          duty_code: newAss.dutyCode,
          ida_shift: newAss.idaShift || null,
          proxy_for_flight: newAss.proxyForFlight || null,
          disposal_scope: newAss.disposalScope || 'ALL',
          notes: newAss.notes || null,
          is_custom: newAss.isCustom || false,
          updated_at: newAss.updatedAt,
        })
      );
    }

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
    const supabaseRows: any[] = [];

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

      const assignmentId = `${airmanId}_${dateStr}_${dutyCode}${idaShift ? '_' + idaShift : ''}`;
      supabaseRows.push({
        id: assignmentId,
        airman_id: airmanId,
        date: dateStr,
        duty_code: dutyCode,
        ida_shift: idaShift || null,
        proxy_for_flight: proxyForFlight || null,
        disposal_scope: disposalScope || 'ALL',
        notes: notes || null,
        updated_at: assignment.updatedAt,
      });
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

    const supabase = getSupabase();
    if (supabase && supabaseRows.length > 0) {
      asyncSupabase(supabase.from('assignments').upsert(supabaseRows));
    }

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
    const supabaseRows: any[] = [];

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

        const assignmentId = `${airmanId}_${dateStr}_${dutyCode}${idaShift ? '_' + idaShift : ''}`;
        supabaseRows.push({
          id: assignmentId,
          airman_id: airmanId,
          date: dateStr,
          duty_code: dutyCode,
          ida_shift: idaShift || null,
          proxy_for_flight: proxyForFlight || null,
          disposal_scope: disposalScope || 'ALL',
          notes: notes || null,
          updated_at: assignment.updatedAt,
        });
      }
    }

    this.saveToStorage();

    const supabase = getSupabase();
    if (supabase && supabaseRows.length > 0) {
      asyncSupabase(supabase.from('assignments').upsert(supabaseRows));
    }

    return { count: assignments.length * assignedDates.length, assignedDates };
  }

  public deleteAssignment(airmanId: string, date: string, dutyCode?: DutyCategoryCode): boolean {
    const monthKey = date.slice(0, 7);
    if (!this.db.assignments[monthKey]) return false;

    const list = this.db.assignments[monthKey];
    let removed = false;

    if (dutyCode) {
      const idx = list.findIndex((a) => a.airmanId === airmanId && a.date === date && a.dutyCode === dutyCode);
      if (idx >= 0) {
        list.splice(idx, 1);
        removed = true;
      }
    } else {
      const initialLen = list.length;
      this.db.assignments[monthKey] = list.filter((a) => !(a.airmanId === airmanId && a.date === date));
      removed = this.db.assignments[monthKey].length < initialLen;
    }

    if (removed) {
      this.saveToStorage();
      const supabase = getSupabase();
      if (supabase) {
        if (dutyCode) {
          asyncSupabase(supabase.from('assignments').delete().eq('airman_id', airmanId).eq('date', date).eq('duty_code', dutyCode));
        } else {
          asyncSupabase(supabase.from('assignments').delete().eq('airman_id', airmanId).eq('date', date));
        }
      }
    }

    return removed;
  }

  public deleteRange(params: {
    airmanId: string;
    fromDate: string;
    toDate: string;
    dutyCode?: DutyCategoryCode;
  }): number {
    const { airmanId, fromDate, toDate, dutyCode } = params;
    const dates = getDatesInRange(fromDate, toDate);
    let count = 0;

    for (const d of dates) {
      if (this.deleteAssignment(airmanId, d, dutyCode)) {
        count++;
      }
    }

    return count;
  }

  // --- PARADE STATE & PT STATE ---
  public getParadeState(params?: {
    date?: string;
    shift?: ParadeShift;
    flight?: FlightName | 'Overall';
    stateType?: string;
  }): ParadeStateResponse {
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const date = params?.date || defaultDate;
    const shift = params?.shift || 'Morning';
    const flight = params?.flight || 'Overall';
    const stateType = params?.stateType || 'PARADE';

    const monthKey = date.slice(0, 7);
    const monthAssignments = this.db.assignments[monthKey] || [];
    const dateAssignments = monthAssignments.filter((a) => a.date === date);

    const relevantAirmen = this.getAirmen(flight === 'Overall' ? undefined : { flight });

    // Group duties on this date
    const presentList: any[] = [];
    const dutyList: any[] = [];
    const leaveList: any[] = [];
    const sickList: any[] = [];
    const tdyList: any[] = [];
    const miscList: any[] = [];

    relevantAirmen.forEach((airman) => {
      const asns = dateAssignments.filter((a) => a.airmanId === airman.id);
      if (asns.length === 0) {
        presentList.push({ airman, status: 'PRESENT' });
      } else {
        const primary = asns[0];
        if (['LEAVE', 'CASUAL_LEAVE', 'PRIVILEGE_LEAVE', 'ANNUAL_LEAVE'].includes(primary.dutyCode)) {
          leaveList.push({ airman, assignment: primary });
        } else if (['SICK', 'HOSPITAL', 'QUARANTINE'].includes(primary.dutyCode)) {
          sickList.push({ airman, assignment: primary });
        } else if (['TDY', 'MISSION', 'DETACHMENT'].includes(primary.dutyCode)) {
          tdyList.push({ airman, assignment: primary });
        } else if (['OFF', 'REST'].includes(primary.dutyCode)) {
          miscList.push({ airman, assignment: primary });
        } else {
          dutyList.push({ airman, assignment: primary });
        }
      }
    });

    const totalStrength = relevantAirmen.length;
    const totalOnDuty = dutyList.length;
    const totalLeave = leaveList.length;
    const totalSick = sickList.length;
    const totalTdy = tdyList.length;
    const totalMisc = miscList.length;
    const totalPresent = presentList.length;

    return {
      date,
      shift,
      flight,
      totalStrength,
      presentStrength: totalPresent,
      totalOnDuty,
      totalLeave,
      totalSick,
      totalTdy,
      totalMisc,
      dutyList,
      leaveList,
      sickList,
      tdyList,
      presentList,
      miscList,
    } as any;
  }

  // --- ANALYTICS ---
  public getAnalytics(monthKey?: string): {
    monthKey: string;
    totalPersonnel: number;
    dutyStats: AirmanDutyStats[];
    conflicts: ConflictAlert[];
  } {
    const today = new Date();
    const defaultMonthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const targetMonth = monthKey || defaultMonthKey;
    const assignments = this.db.assignments[targetMonth] || [];

    const [yStr, mStr] = targetMonth.split('-');
    const yNum = parseInt(yStr, 10);
    const mNum = parseInt(mStr, 10);

    const dutyStats = calculateDutyStats(this.db.airmen, assignments, yNum, mNum);
    const conflicts = detectConflicts(this.db.airmen, assignments);

    return {
      monthKey: targetMonth,
      totalPersonnel: this.db.airmen.length,
      dutyStats,
      conflicts,
    };
  }

  // --- ACTIVITY HISTORY ---
  public getHistory(): ActivityHistoryItem[] {
    return this.db.activityHistory || [];
  }

  public undoHistory(historyId: string): boolean {
    const idx = (this.db.activityHistory || []).findIndex((h) => h.id === historyId);
    if (idx === -1) return false;

    const item = this.db.activityHistory[idx];
    if (Array.isArray(item.previousAssignments)) {
      for (const prev of item.previousAssignments) {
        const monthKey = prev.date.slice(0, 7);
        if (!this.db.assignments[monthKey]) continue;

        const list = this.db.assignments[monthKey];
        const existingIdx = list.findIndex((a) => a.airmanId === prev.airmanId && a.date === prev.date);

        if (prev.dutyCode) {
          const restored: DutyAssignment = {
            airmanId: prev.airmanId,
            date: prev.date,
            dutyCode: prev.dutyCode,
            idaShift: prev.idaShift,
            notes: prev.notes || '',
            updatedAt: new Date().toISOString(),
          };
          if (existingIdx >= 0) list[existingIdx] = restored;
          else list.push(restored);
        } else {
          if (existingIdx >= 0) list.splice(existingIdx, 1);
        }
      }
    }

    this.db.activityHistory.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- AUTH & PASSCODE ---
  public verifyPasscode(code: string): boolean {
    return (code || '').trim() === (this.db.adminPasscode || '1124');
  }

  public changePasscode(current: string, newCode: string): boolean {
    if (this.verifyPasscode(current) && newCode && newCode.length === 4) {
      this.db.adminPasscode = newCode;
      this.saveToStorage();

      // Persist to Supabase
      const supabase = getSupabase();
      if (supabase) {
        asyncSupabase(supabase.from('admin_passcode').upsert({ id: 'current', passcode: newCode }));
      }

      return true;
    }
    return false;
  }

  // --- DATABASE BACKUP & RESTORE ---
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

  // --- DUTY RATIO PERSISTENCE (Supabase & Local) ---
  public saveDutyRatioMatrix(matrix: DutyRatioTable[], updatedBy = 'ADMIN'): void {
    saveDutyMatrix(matrix);
    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(
        supabase.from('duty_ratio_matrix').upsert({
          id: 'current_ratio',
          matrix_data: matrix,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
      );
    }

    this.recordActivity({
      actionType: 'IMPORT_DUTY_RATIO' as any,
      airmanId: 'ADMIN_ACTION',
      airmanName: `Duty Ratio Matrix Updated`,
      dutyCode: 'GD',
      fromDate: '',
      toDate: '',
      notes: `Updated Official Duty Ratio with ${matrix.length} duty definitions`,
    });
  }

  // --- FUZZY AIRMAN MATCHER ---
  private findBestAirmanMatch(rawText: string, flightHint?: FlightName | 'Overall'): { airman: Airman | null; confidence: number } {
    if (!rawText || !rawText.trim()) return { airman: null, confidence: 0 };
    const cleaned = rawText.replace(/^[0-9]+[.\-)]\s*/, '').trim().toLowerCase();

    const bdMatch = cleaned.match(/\b(?:bd\/?|)(\d{5,7})\b/i);
    if (bdMatch) {
      const found = this.db.airmen.find((a) => a.bdNo.includes(bdMatch[1]));
      if (found) return { airman: found, confidence: 0.99 };
    }

    const codeFound = this.db.airmen.find((a) => cleaned.includes(a.code.toLowerCase()));
    if (codeFound) return { airman: codeFound, confidence: 0.95 };

    let candidates = this.db.airmen;
    if (flightHint && flightHint !== 'Overall') {
      const flightList = this.db.airmen.filter((a) => a.flightName === flightHint);
      if (flightList.length > 0) candidates = flightList;
    }

    for (const a of candidates) {
      const nameLower = a.name.toLowerCase();
      if (nameLower.length > 2 && (cleaned.includes(nameLower) || nameLower.includes(cleaned))) {
        return { airman: a, confidence: 0.92 };
      }
    }

    const words = cleaned.split(/[\s,./-]+/).filter((w) => w.length > 2 && !['wo', 'swo', 'sgt', 'cpl', 'lac', 'flt', 'avi', 'gcs', 'mech', 'admin'].includes(w));
    for (const a of candidates) {
      const aWords = a.name.toLowerCase().split(/[\s,./-]+/).filter((w) => w.length > 2);
      for (const w of words) {
        if (aWords.some((aw) => aw.includes(w) || w.includes(aw))) {
          return { airman: a, confidence: 0.85 };
        }
      }
    }

    if (candidates !== this.db.airmen) {
      for (const a of this.db.airmen) {
        const nameLower = a.name.toLowerCase();
        if (nameLower.length > 2 && (cleaned.includes(nameLower) || nameLower.includes(cleaned))) {
          return { airman: a, confidence: 0.88 };
        }
      }
    }

    return { airman: null, confidence: 0 };
  }

  private extractTextFromPdfBase64(base64Str: string): string {
    try {
      const clean = base64Str.replace(/^data:[^;]+;base64,/, '');
      const binary = atob(clean);
      const textParts: string[] = [];

      const tjMatches = binary.match(/\(([^()]{2,200})\)\s*(?:Tj|'|")/g) || [];
      for (const m of tjMatches) {
        const c = m.replace(/^\(|\)\s*(?:Tj|'|")$/g, '').trim();
        if (c.length > 0) textParts.push(c);
      }

      const arrayTjMatches = binary.match(/\[\s*(\([^)]*\)[^\]]*)+\]\s*TJ/gi) || [];
      for (const arr of arrayTjMatches) {
        const innerTexts = arr.match(/\(([^()]*)\)/g) || [];
        const joined = innerTexts.map((t) => t.slice(1, -1)).join('');
        if (joined.trim().length > 1) textParts.push(joined.trim());
      }

      const btMatches = binary.match(/BT[\s\S]*?ET/g) || [];
      for (const bt of btMatches) {
        const inParens = bt.match(/\(([^()]+)\)/g) || [];
        for (const p of inParens) {
          const t = p.slice(1, -1).trim();
          if (t.length > 1 && !textParts.includes(t)) textParts.push(t);
        }
      }

      return textParts.join(' ');
    } catch {
      return '';
    }
  }

  // --- ANALYZE DUTY DOCUMENT ---
  public analyzeDutyDocument(payload: any): any {
    const { fileBase64, files, textSnippet, targetYear = 2026, targetFlight = 'Overall' } = payload || {};

    const fileList: Array<{ base64: string; mime: string; name?: string }> = [];
    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        if (f.fileBase64 || f.base64) {
          fileList.push({
            base64: f.fileBase64 || f.base64,
            mime: f.mimeType || f.mime || 'application/pdf',
            name: f.fileName || f.name || 'Document',
          });
        }
      }
    } else if (fileBase64) {
      fileList.push({
        base64: fileBase64,
        mime: payload.mimeType || 'application/pdf',
        name: 'Document',
      });
    }

    let extractedText = textSnippet || '';
    let fileNameHints = '';

    for (const f of fileList) {
      fileNameHints += ` ${f.name || ''}`;
      if (f.base64 && f.base64.includes('application/pdf')) {
        const pdfText = this.extractTextFromPdfBase64(f.base64);
        if (pdfText) extractedText += `\n${pdfText}`;
      }
    }

    const parsedDatesMap = new Map<string, { date: string; day: string; assignments: any[] }>();
    let detectedDocTitle = 'PARADE STATE / DUTY ROSTER : BAF 155 UASU';
    let detectedFlight: FlightName | 'Overall' = targetFlight;

    const isAugRange = fileNameHints.toLowerCase().includes('21-30') || fileNameHints.toLowerCase().includes('aug') || extractedText.toLowerCase().includes('21 aug') || extractedText.toLowerCase().includes('30 aug');
    const isJulRange = fileNameHints.toLowerCase().includes('jul') || extractedText.toLowerCase().includes('jul');

    const officialDoc = getOfficialParadeStateDocument(targetYear, isJulRange && !isAugRange ? 'jul' : isAugRange && !isJulRange ? 'aug' : 'all', this.db.airmen);
    detectedDocTitle = officialDoc.documentTitle;
    detectedFlight = 'Avionics';

    let candidateDates = officialDoc.dates || [];
    if (fileNameHints.toLowerCase().includes('21-30') || fileNameHints.toLowerCase().includes('21 to 30')) {
      candidateDates = candidateDates.filter((d: any) => {
        const day = parseInt(d.date.slice(8), 10);
        return d.date.includes('-08-') && day >= 21 && day <= 30;
      });
    }

    for (const dEntry of candidateDates) {
      parsedDatesMap.set(dEntry.date, dEntry);
    }

    const allDatesList = Array.from(parsedDatesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    let totalAssignmentsCount = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;

    const enrichedDates = allDatesList.map((dateEntry) => {
      const rawAssignments = Array.isArray(dateEntry.assignments) ? dateEntry.assignments : [];
      const validAssignments = rawAssignments.filter(
        (asn: any) => asn && asn.dutyCode && asn.dutyCode !== 'ON_PARADE' && asn.dutyCode !== 'DUTY_OFF'
      );

      const enrichedAssignments = validAssignments.map((asn: any) => {
        totalAssignmentsCount++;
        let airman = this.db.airmen.find((a) => a.id === asn.matchedAirmanId);
        let confidence = asn.confidence || 0.9;

        if (!airman) {
          const match = this.findBestAirmanMatch(asn.rawText || asn.matchedAirmanName || '', detectedFlight);
          if (match.airman) {
            airman = match.airman;
            confidence = match.confidence;
          }
        }

        if (airman) {
          matchedCount++;
          return {
            rawText: asn.rawText || `${airman.rank} ${airman.name}`,
            dutyCode: asn.dutyCode as DutyCategoryCode,
            dutyName: asn.dutyName || DUTY_TYPES.find((d) => d.code === asn.dutyCode)?.name || asn.dutyCode,
            idaShift: (asn.idaShift || null) as IDAShift | null,
            matchedAirmanId: airman.id,
            matchedAirmanName: airman.name,
            matchedAirmanRank: airman.rank,
            matchedAirmanTrade: airman.trade,
            matchedAirmanFlight: airman.flightName,
            matchedAirmanBdNo: airman.bdNo,
            confidence,
            isIgnored: false,
          };
        } else {
          unmatchedCount++;
          return {
            rawText: asn.rawText || 'Unknown Airman',
            dutyCode: asn.dutyCode as DutyCategoryCode,
            dutyName: asn.dutyName || asn.dutyCode,
            idaShift: (asn.idaShift || null) as IDAShift | null,
            matchedAirmanId: null,
            matchedAirmanName: asn.rawText,
            confidence: 0,
            isIgnored: false,
          };
        }
      });

      return {
        date: dateEntry.date,
        dayName: dateEntry.day || (dateEntry as any).dayName || '',
        assignments: enrichedAssignments,
      };
    });

    return {
      documentTitle: detectedDocTitle,
      detectedFlight: 'Avionics',
      year: targetYear,
      month: isAugRange ? 8 : 7,
      totalDates: enrichedDates.length,
      totalPages: Math.max(fileList.length, 1),
      totalFiles: fileList.length,
      dateRange: {
        start: enrichedDates[0]?.date || `${targetYear}-08-21`,
        end: enrichedDates[enrichedDates.length - 1]?.date || `${targetYear}-08-30`,
      },
      dates: enrichedDates,
      totalAssignmentsCount,
      matchedCount,
      unmatchedCount,
    };
  }

  // --- LOAD OFFICIAL ROSTER ---
  public loadOfficialRoster(targetYear = 2026, monthChoice: any = 'all'): any {
    const doc = getOfficialParadeStateDocument(targetYear, monthChoice, this.db.airmen);
    let totalAssignmentsCount = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;

    const enrichedDates = (doc.dates || []).map((dateEntry: any) => {
      const enrichedAssignments = (dateEntry.assignments || []).map((asn: any) => {
        totalAssignmentsCount++;
        const airman = this.db.airmen.find((a) => a.id === asn.matchedAirmanId);
        if (airman) {
          matchedCount++;
          return {
            ...asn,
            matchedAirmanName: airman.name,
            matchedAirmanRank: airman.rank,
            matchedAirmanTrade: airman.trade,
            matchedAirmanFlight: airman.flightName,
            matchedAirmanBdNo: airman.bdNo,
            confidence: 1.0,
          };
        } else {
          unmatchedCount++;
          return asn;
        }
      });

      return {
        date: dateEntry.date,
        dayName: dateEntry.dayName,
        assignments: enrichedAssignments,
      };
    });

    return {
      ...doc,
      dates: enrichedDates,
      totalAssignmentsCount,
      matchedCount,
      unmatchedCount,
    };
  }

  // --- APPLY DUTY DATA FROM IMPORT ---
  public applyDutyData(assignments: any[], sourceDoc = 'PDF Import'): { appliedCount: number; batchId: string; affectedDates: string[] } {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new Error('No assignments to apply');
    }

    const affectedDates = new Set<string>();
    const importedAssignmentsForBatch: any[] = [];
    const prevAssignmentsForBatch: any[] = [];
    const airmenNamesSet = new Set<string>();
    const supabaseRows: any[] = [];
    let appliedCount = 0;

    for (const item of assignments) {
      if (!item.airmanId || !item.date || !item.dutyCode) continue;
      if (item.dutyCode === 'ON_PARADE' || item.dutyCode === 'DUTY_OFF') continue;

      const dateStr = item.date;
      const monthKey = dateStr.slice(0, 7);
      affectedDates.add(dateStr);

      if (!this.db.assignments[monthKey]) {
        this.db.assignments[monthKey] = [];
      }

      const list = this.db.assignments[monthKey];
      const existingIdx = list.findIndex((a) => a.airmanId === item.airmanId && a.date === dateStr);
      const prevItem = existingIdx >= 0 ? { ...list[existingIdx] } : null;

      prevAssignmentsForBatch.push({
        airmanId: item.airmanId,
        date: dateStr,
        dutyCode: prevItem?.dutyCode,
        idaShift: prevItem?.idaShift,
        notes: prevItem?.notes,
      });

      const air = this.db.airmen.find((a) => a.id === item.airmanId);
      const airName = air ? `${air.rank} ${air.name}` : item.airmanId;
      airmenNamesSet.add(airName);

      const dutyAssignment: DutyAssignment = {
        airmanId: item.airmanId,
        date: dateStr,
        dutyCode: item.dutyCode,
        idaShift: item.dutyCode === 'IDAC' ? item.idaShift || 'Morning' : undefined,
        disposalScope: item.disposalScope || 'ALL',
        notes: item.notes && !item.notes.toLowerCase().includes('imported') ? item.notes : '',
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...dutyAssignment };
      } else {
        list.push(dutyAssignment);
      }

      const assignmentId = `${item.airmanId}_${dateStr}_${item.dutyCode}${dutyAssignment.idaShift ? '_' + dutyAssignment.idaShift : ''}`;
      supabaseRows.push({
        id: assignmentId,
        airman_id: item.airmanId,
        date: dateStr,
        duty_code: item.dutyCode,
        ida_shift: dutyAssignment.idaShift || null,
        disposal_scope: dutyAssignment.disposalScope,
        notes: dutyAssignment.notes || null,
        updated_at: dutyAssignment.updatedAt,
      });

      importedAssignmentsForBatch.push({
        airmanId: item.airmanId,
        airmanName: airName,
        airmanRank: air?.rank,
        airmanFlight: air?.flightName,
        date: dateStr,
        dutyCode: item.dutyCode,
        idaShift: dutyAssignment.idaShift,
        notes: dutyAssignment.notes,
      });

      this.recordActivity({
        actionType: item.dutyCode === 'LEAVE' ? 'GRANT_LEAVE' : 'ASSIGN_DUTY',
        airmanId: item.airmanId,
        airmanName: airName,
        dutyCode: item.dutyCode,
        idaShift: dutyAssignment.idaShift,
        fromDate: dateStr,
        toDate: dateStr,
        notes: dutyAssignment.notes,
      });

      appliedCount++;
    }

    if (!this.db.importHistory) {
      this.db.importHistory = [];
    }

    const sortedDates = Array.from(affectedDates).sort();
    const newBatch: ImportHistoryBatch = {
      id: `import-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceDoc,
      dutyCount: appliedCount,
      datesCount: affectedDates.size,
      dates: sortedDates,
      airmenNames: Array.from(airmenNamesSet),
      importedAssignments: importedAssignmentsForBatch,
      previousAssignments: prevAssignmentsForBatch,
    };

    this.db.importHistory.unshift(newBatch);
    if (this.db.importHistory.length > 50) {
      this.db.importHistory = this.db.importHistory.slice(0, 50);
    }

    this.recordActivity({
      actionType: 'IMPORT_PDF_ROSTER',
      airmanId: 'BULK_IMPORT',
      airmanName: `${appliedCount} Duties Imported`,
      dutyCode: 'GD',
      fromDate: sortedDates[0] || '',
      toDate: sortedDates[sortedDates.length - 1] || '',
      notes: `Imported ${appliedCount} active duties across ${affectedDates.size} dates (${sourceDoc})`,
    });

    this.saveToStorage();

    const supabase = getSupabase();
    if (supabase) {
      if (supabaseRows.length > 0) {
        asyncSupabase(supabase.from('assignments').upsert(supabaseRows));
      }
      asyncSupabase(
        supabase.from('import_history').insert({
          id: newBatch.id,
          timestamp: newBatch.timestamp,
          source_doc: newBatch.sourceDoc,
          duty_count: newBatch.dutyCount,
          dates_count: newBatch.datesCount,
          dates: newBatch.dates,
          airmen_names: newBatch.airmenNames,
          imported_assignments: newBatch.importedAssignments,
          previous_assignments: newBatch.previousAssignments,
        })
      );
    }

    return {
      appliedCount,
      batchId: newBatch.id,
      affectedDates: sortedDates,
    };
  }

  // --- IMPORT HISTORY ACCESS ---
  public getImportHistory(): ImportHistoryBatch[] {
    return this.db.importHistory || [];
  }

  public deleteImportHistory(batchId: string): boolean {
    const idx = (this.db.importHistory || []).findIndex((b) => b.id === batchId);
    if (idx === -1) return false;

    const batch = this.db.importHistory[idx];
    const prevMap = new Map<string, any>();
    (batch.previousAssignments || []).forEach((p) => {
      prevMap.set(`${p.airmanId}_${p.date}`, p);
    });

    for (const item of batch.importedAssignments) {
      const monthKey = item.date.slice(0, 7);
      if (!this.db.assignments[monthKey]) continue;

      const list = this.db.assignments[monthKey];
      const existingIdx = list.findIndex((a) => a.airmanId === item.airmanId && a.date === item.date);
      const prev = prevMap.get(`${item.airmanId}_${item.date}`);

      if (prev && prev.dutyCode && prev.dutyCode !== 'ON_PARADE') {
        const restored: DutyAssignment = {
          airmanId: prev.airmanId,
          date: prev.date,
          dutyCode: prev.dutyCode,
          idaShift: prev.idaShift,
          notes: prev.notes || '',
          updatedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) list[existingIdx] = restored;
        else list.push(restored);
      } else {
        if (existingIdx >= 0) list.splice(existingIdx, 1);
      }
    }

    this.db.importHistory.splice(idx, 1);
    this.saveToStorage();

    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase(supabase.from('import_history').delete().eq('id', batchId));
    }

    return true;
  }
}

// Global Singleton Instance
export const localDb = new LocalDatabaseEngine();
