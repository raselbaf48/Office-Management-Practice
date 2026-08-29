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
import { getSupabase, getSupabaseConfigDiagnostics, SupabaseConfigDiagnostics } from './supabaseClient';
import { DutyRatioTable, INITIAL_OFFICIAL_DUTY_MATRIX, getStoredDutyMatrix, saveDutyMatrix } from '../data/officialDutyRatioMatrix';
import { findBestAirmanMatch as matchAirmanRankFirst, parseRosterTextHeuristically } from '../utils/airmanMatcher';

export interface LocalStorageDB {
  airmen: Airman[];
  assignments: Record<string, DutyAssignment[]>; // monthKey YYYY-MM -> DutyAssignment[]
  activityHistory: ActivityHistoryItem[];
  adminPasscode: string;
  importHistory: ImportHistoryBatch[];
  lastUpdated: string;
}

export interface SupabaseSyncErrorEvent {
  id: string;
  operation: string;
  table: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  timestamp: string;
}

export interface SupabaseSyncStatusState {
  isConfigured: boolean;
  status: 'idle' | 'syncing' | 'connected' | 'error' | 'unconfigured';
  lastSyncTime: string | null;
  lastSuccessMessage: string | null;
  activeErrors: SupabaseSyncErrorEvent[];
  diagnostics: SupabaseConfigDiagnostics;
  d1Active: boolean;
  d1LastSyncTime: string | null;
}

let globalSyncErrors: SupabaseSyncErrorEvent[] = [];
let lastSyncStatus: 'idle' | 'syncing' | 'connected' | 'error' | 'unconfigured' = 'idle';
let lastSyncTime: string | null = null;
let lastSuccessMessage: string | null = null;
let d1Connected: boolean = false;
let d1LastSyncTime: string | null = null;

export const getSupabaseSyncState = (): SupabaseSyncStatusState => {
  const diagnostics = getSupabaseConfigDiagnostics();
  return {
    isConfigured: diagnostics.isConfigured || d1Connected,
    status: d1Connected ? 'connected' : (!diagnostics.isConfigured ? 'unconfigured' : (globalSyncErrors.length > 0 ? 'error' : lastSyncStatus)),
    lastSyncTime: d1LastSyncTime || lastSyncTime,
    lastSuccessMessage: d1Connected ? 'Cloudflare D1 Database Active' : lastSuccessMessage,
    activeErrors: [...globalSyncErrors],
    diagnostics,
    d1Active: d1Connected,
    d1LastSyncTime,
  };
};

export const clearSupabaseSyncErrors = (): void => {
  globalSyncErrors = [];
  broadcastSyncState();
};

function broadcastSyncState(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('supabase_sync_update', {
        detail: getSupabaseSyncState(),
      })
    );
  }
}

export function reportSyncError(err: Omit<SupabaseSyncErrorEvent, 'id' | 'timestamp'> & { timestamp?: string }): void {
  const item: SupabaseSyncErrorEvent = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    operation: err.operation,
    table: err.table,
    message: err.message || 'Unknown PostgREST error',
    code: err.code,
    details: err.details,
    hint: err.hint,
    timestamp: err.timestamp || new Date().toLocaleTimeString(),
  };
  globalSyncErrors.unshift(item);
  if (globalSyncErrors.length > 20) {
    globalSyncErrors = globalSyncErrors.slice(0, 20);
  }
  lastSyncStatus = 'error';
  console.error(`🚨 [Supabase Sync Failure] Operation "${err.operation}" on table "${err.table}" failed:`, {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  });
  broadcastSyncState();
}

export function reportSyncSuccess(operation: string, table: string): void {
  lastSyncStatus = 'connected';
  lastSyncTime = new Date().toLocaleTimeString();
  lastSuccessMessage = `Successfully executed ${operation} on ${table}`;
  // Clear any existing sync errors on successful operation
  if (globalSyncErrors.length > 0) {
    globalSyncErrors = globalSyncErrors.filter((e) => e.table !== table);
  }
  broadcastSyncState();
}

/**
 * Intelligent Schema Adapter for Supabase Postgres tables
 * Handles schema differences (snake_case vs camelCase and column aliases like action vs action_type)
 */
export function adaptRowForTable(table: string, row: any, mode: 'snake' | 'camel' | 'action_compat' = 'camel'): any {
  if (!row || typeof row !== 'object') return row;
  const res: any = {};

  if (table === 'assignments') {
    if (mode === 'action_compat' || mode === 'camel') {
      res.id = row.id || `${row.airman_id || row.airmanId}_${row.date}_${row.duty_code || row.dutyCode}${row.ida_shift || row.idaShift ? '_' + (row.ida_shift || row.idaShift) : ''}`;
      res.airmanId = row.airmanId ?? row.airman_id ?? '';
      res.date = row.date ?? '';
      res.dutyCode = row.dutyCode ?? row.duty_code ?? 'GD';
      res.idaShift = row.idaShift ?? row.ida_shift ?? null;
      res.proxyForFlight = row.proxyForFlight ?? row.proxy_for_flight ?? null;
      res.disposalScope = row.disposalScope ?? row.disposal_scope ?? 'ALL';
      res.notes = row.notes ?? null;
      res.isCustom = row.isCustom ?? row.is_custom ?? false;
      res.updatedAt = row.updatedAt ?? row.updated_at ?? new Date().toISOString();
      return res;
    } else {
      res.id = row.id || `${row.airman_id || row.airmanId}_${row.date}_${row.duty_code || row.dutyCode}${row.ida_shift || row.idaShift ? '_' + (row.ida_shift || row.idaShift) : ''}`;
      res.airman_id = row.airman_id ?? row.airmanId ?? '';
      res.date = row.date ?? '';
      res.duty_code = row.duty_code ?? row.dutyCode ?? 'GD';
      res.ida_shift = row.ida_shift ?? row.idaShift ?? null;
      res.proxy_for_flight = row.proxy_for_flight ?? row.proxyForFlight ?? null;
      res.disposal_scope = row.disposal_scope ?? row.disposalScope ?? 'ALL';
      res.notes = row.notes ?? null;
      res.is_custom = row.is_custom ?? row.isCustom ?? false;
      res.updated_at = row.updated_at ?? row.updatedAt ?? new Date().toISOString();
      return res;
    }
  }

  if (table === 'activity_history') {
    const act = row.action ?? row.action_type ?? row.actionType ?? 'ASSIGN_RANGE';
    if (mode === 'action_compat' || mode === 'camel') {
      res.id = row.id || `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      res.action = act; // Postgres column 'action' NOT NULL constraint
      res.actionType = act;
      res.airmanId = row.airmanId ?? row.airman_id ?? '';
      res.airmanName = row.airmanName ?? row.airman_name ?? '';
      res.airmanRank = row.airmanRank ?? row.airman_rank ?? '';
      res.airmanTrade = row.airmanTrade ?? row.airman_trade ?? '';
      res.dutyCode = row.dutyCode ?? row.duty_code ?? '';
      res.idaShift = row.idaShift ?? row.ida_shift ?? null;
      res.fromDate = row.fromDate ?? row.from_date ?? '';
      res.toDate = row.toDate ?? row.to_date ?? '';
      res.notes = row.notes ?? null;
      res.previousAssignments = row.previousAssignments ?? row.previous_assignments ?? null;
      res.timestamp = row.timestamp ?? new Date().toISOString();
      return res;
    } else {
      res.id = row.id || `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      res.action = act;
      res.action_type = act;
      res.airman_id = row.airman_id ?? row.airmanId ?? '';
      res.airman_name = row.airman_name ?? row.airmanName ?? '';
      res.airman_rank = row.airman_rank ?? row.airmanRank ?? '';
      res.airman_trade = row.airman_trade ?? row.airmanTrade ?? '';
      res.duty_code = row.duty_code ?? row.dutyCode ?? '';
      res.ida_shift = row.ida_shift ?? row.idaShift ?? null;
      res.from_date = row.from_date ?? row.fromDate ?? '';
      res.to_date = row.to_date ?? row.toDate ?? '';
      res.notes = row.notes ?? null;
      res.previous_assignments = row.previous_assignments ?? row.previousAssignments ?? null;
      res.timestamp = row.timestamp ?? new Date().toISOString();
      return res;
    }
  }

  if (table === 'airmen') {
    if (mode === 'action_compat' || mode === 'camel') {
      res.id = String(row.id);
      res.serNo = row.serNo ?? row.ser_no ?? 1;
      res.code = row.code ?? '';
      res.bdNo = row.bdNo ?? row.bd_no ?? '';
      res.rank = row.rank ?? 'LAC';
      res.name = row.name ?? 'Airman';
      res.trade = row.trade ?? '';
      res.addressBlock = row.addressBlock ?? row.address_block ?? '';
      res.mobileNo = row.mobileNo ?? row.mobile_no ?? '';
      res.flightName = row.flightName ?? row.flight_name ?? 'Admin';
      res.remarks = row.remarks ?? '';
      res.active = row.active !== false;
      return res;
    } else {
      res.id = String(row.id);
      res.ser_no = row.ser_no ?? row.serNo ?? 1;
      res.code = row.code ?? '';
      res.bd_no = row.bd_no ?? row.bdNo ?? '';
      res.rank = row.rank ?? 'LAC';
      res.name = row.name ?? 'Airman';
      res.trade = row.trade ?? '';
      res.address_block = row.address_block ?? row.addressBlock ?? '';
      res.mobile_no = row.mobile_no ?? row.mobileNo ?? '';
      res.flight_name = row.flight_name ?? row.flightName ?? 'Admin';
      res.remarks = row.remarks ?? '';
      res.active = row.active !== false;
      return res;
    }
  }

  return row;
}

export async function asyncSupabase(
  operationName: string,
  table: string,
  promiseLike: any,
  rawPayload?: any,
  operationType: 'insert' | 'upsert' | 'update' | 'delete' = 'upsert'
): Promise<any> {
  if (!promiseLike) return null;
  try {
    const res = await Promise.resolve(promiseLike);
    if (res && res.error) {
      const errMsg = (res.error.message || '').toLowerCase();
      const code = res.error.code || '';

      // Auto-Retry if column mismatch or NOT NULL constraint occurred (e.g. airmanId or action column)
      if (
        (code === '23502' || code === 'PGRST204' || code === 'PGRST104' || errMsg.includes('violates') || errMsg.includes('column')) &&
        rawPayload &&
        getSupabase()
      ) {
        try {
          const supabase = getSupabase()!;
          const adapted = Array.isArray(rawPayload)
            ? rawPayload.map((r) => adaptRowForTable(table, r, 'action_compat'))
            : adaptRowForTable(table, rawPayload, 'action_compat');

          let retryPromise: any;
          if (operationType === 'insert') {
            retryPromise = supabase.from(table).insert(adapted);
          } else if (operationType === 'upsert') {
            retryPromise = supabase.from(table).upsert(adapted);
          } else if (operationType === 'update') {
            retryPromise = supabase.from(table).update(adapted);
          }

          if (retryPromise) {
            const retryRes = await Promise.resolve(retryPromise);
            if (!retryRes?.error) {
              reportSyncSuccess(operationName + '_ADAPTED', table);
              return retryRes;
            }
          }
        } catch (retryErr) {
          console.warn(`[Supabase Retry] Schema adaptation retry failed:`, retryErr);
        }
      }

      reportSyncError({
        operation: operationName,
        table,
        message: res.error.message || `PostgREST error on ${table}`,
        code: res.error.code,
        details: res.error.details,
        hint: res.error.hint,
      });
      return res;
    }
    reportSyncSuccess(operationName, table);
    return res;
  } catch (err: any) {
    reportSyncError({
      operation: operationName,
      table,
      message: err?.message || String(err),
    });
    return null;
  }
}

const STORAGE_KEY = 'baf_155_uasu_v2_db';
const DEFAULT_ADMIN_PASSCODE = '1124';

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
  private isSupabaseSyncing: boolean = false;
  private isD1Syncing: boolean = false;

  constructor() {
    this.db = this.loadInitialLocalState();
    if (typeof window !== 'undefined') {
      // Async sync from Cloudflare D1 first, then Supabase
      this.syncFromD1();
      this.syncFromSupabase();
    }
  }

  /**
   * Synchronize database with Cloudflare D1 SQL storage
   */
  public async syncFromD1(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined' || this.isD1Syncing) return false;
    this.isD1Syncing = true;
    try {
      const res = await fetch('/api/d1-sync', { cache: 'no-store' });
      if (!res.ok) return false;
      const json = await res.json();
      if (json && json.isConfigured && json.data) {
        d1Connected = true;
        let hasUpdates = false;
        if (json.data.airmen && Array.isArray(json.data.airmen) && json.data.airmen.length > 0) {
          this.db.airmen = json.data.airmen;
          hasUpdates = true;
        }
        if (json.data.assignments && typeof json.data.assignments === 'object') {
          this.db.assignments = { ...this.db.assignments, ...json.data.assignments };
          hasUpdates = true;
        }
        if (json.data.adminPasscode) {
          this.db.adminPasscode = String(json.data.adminPasscode);
          hasUpdates = true;
        }
        if (json.data.activityHistory && Array.isArray(json.data.activityHistory)) {
          this.db.activityHistory = json.data.activityHistory;
          hasUpdates = true;
        }
        if (hasUpdates) {
          this.saveToStorage(this.db, false, false);
          window.dispatchEvent(new CustomEvent('baf_state_updated', { detail: { source: 'd1Sync' } }));
        } else if (!json.data.airmen) {
          // Initial seed D1 with initial airmen and assignments
          this.saveToD1(this.db);
        }
        d1LastSyncTime = new Date().toLocaleTimeString();
        broadcastSyncState();
        return true;
      }
    } catch {
      // Non-Cloudflare Pages or offline environment
    } finally {
      this.isD1Syncing = false;
    }
    return false;
  }

  /**
   * Push changes to Cloudflare D1
   */
  private async saveToD1(dbToSave: LocalStorageDB): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const res = await fetch('/api/d1-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: [
            { key: 'airmen', value: dbToSave.airmen },
            { key: 'assignments', value: dbToSave.assignments },
            { key: 'adminPasscode', value: dbToSave.adminPasscode },
            { key: 'activityHistory', value: dbToSave.activityHistory },
            { key: 'lastUpdated', value: dbToSave.lastUpdated },
          ],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          d1Connected = true;
          d1LastSyncTime = new Date().toLocaleTimeString();
          broadcastSyncState();
        }
      }
    } catch {
      // Non-critical fallback
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
              adminPasscode: parsed.adminPasscode || DEFAULT_ADMIN_PASSCODE,
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
    const initialPasscode = DEFAULT_ADMIN_PASSCODE;
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
    if (!supabase || this.isSupabaseSyncing) {
      if (!supabase) {
        lastSyncStatus = 'unconfigured';
        broadcastSyncState();
      }
      return;
    }

    this.isSupabaseSyncing = true;
    lastSyncStatus = 'syncing';
    broadcastSyncState();

    try {
      // 1. Fetch Airmen
      const { data: airmenData, error: airmenErr } = await supabase.from('airmen').select('*').order('ser_no', { ascending: true });
      if (airmenErr) {
        reportSyncError({
          operation: 'SELECT',
          table: 'airmen',
          message: airmenErr.message,
          code: airmenErr.code,
          details: airmenErr.details,
          hint: airmenErr.hint,
        });
      } else if (airmenData && airmenData.length > 0) {
        this.db.airmen = airmenData.map((row) => ({
          id: String(row.id),
          serNo: Number(row.ser_no ?? row.serNo ?? 1),
          code: String(row.code ?? ''),
          bdNo: String(row.bd_no ?? row.bdNo ?? ''),
          rank: (row.rank || 'LAC') as any,
          name: String(row.name ?? 'Airman'),
          trade: String(row.trade ?? ''),
          addressBlock: String(row.address_block ?? row.addressBlock ?? ''),
          mobileNo: String(row.mobile_no ?? row.mobileNo ?? ''),
          flightName: (row.flight_name ?? row.flightName ?? 'Admin') as FlightName,
          remarks: String(row.remarks ?? ''),
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
        await asyncSupabase('SEED_INITIAL', 'airmen', supabase.from('airmen').insert(initialRows));
      }

      // 2. Fetch Assignments
      const { data: assignData, error: assignErr } = await supabase.from('assignments').select('*');
      if (assignErr) {
        reportSyncError({
          operation: 'SELECT',
          table: 'assignments',
          message: assignErr.message,
          code: assignErr.code,
          details: assignErr.details,
          hint: assignErr.hint,
        });
      } else if (assignData && assignData.length > 0) {
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
            updatedAt: row.updated_at || row.updatedAt,
          });
        });

        // Non-destructive merge with local storage
        for (const [monthKey, remoteAssignments] of Object.entries(monthMap)) {
          const localAssignments = this.db.assignments[monthKey] || [];
          if (localAssignments.length === 0) {
            this.db.assignments[monthKey] = remoteAssignments;
          } else {
            const mergedMap = new Map<string, DutyAssignment>();
            remoteAssignments.forEach((ra) => {
              const key = `${ra.airmanId}_${ra.date}_${ra.dutyCode}${ra.idaShift ? '_' + ra.idaShift : ''}`;
              mergedMap.set(key, ra);
            });
            localAssignments.forEach((la) => {
              const key = `${la.airmanId}_${la.date}_${la.dutyCode}${la.idaShift ? '_' + la.idaShift : ''}`;
              const remote = mergedMap.get(key);
              if (!remote || (la.updatedAt && remote.updatedAt && new Date(la.updatedAt).getTime() >= new Date(remote.updatedAt).getTime())) {
                mergedMap.set(key, la);
              }
            });
            this.db.assignments[monthKey] = Array.from(mergedMap.values());
          }
        }
      } else if (assignData && assignData.length === 0) {
        // Supabase assignments table is empty, seed from local database
        const allLocalRows: any[] = [];
        for (const list of Object.values(this.db.assignments)) {
          for (const a of list) {
            allLocalRows.push({
              id: `${a.airmanId}_${a.date}_${a.dutyCode}${a.idaShift ? '_' + a.idaShift : ''}`,
              airman_id: a.airmanId,
              date: a.date,
              duty_code: a.dutyCode,
              ida_shift: a.idaShift || null,
              proxy_for_flight: a.proxyForFlight || null,
              disposal_scope: a.disposalScope || 'ALL',
              notes: a.notes || null,
              is_custom: a.isCustom || false,
              updated_at: a.updatedAt || new Date().toISOString(),
            });
          }
        }
        if (allLocalRows.length > 0) {
          for (let i = 0; i < allLocalRows.length; i += 50) {
            const batch = allLocalRows.slice(i, i + 50);
            asyncSupabase('SEED_ASSIGNMENTS', 'assignments', supabase.from('assignments').upsert(batch), batch, 'upsert');
          }
        }
      }

      // 3. Fetch Admin Passcode (safe query for both integer PK or text PK)
      const { data: passRows, error: passErr } = await supabase.from('admin_passcode').select('*').limit(1);
      if (passErr && passErr.code !== 'PGRST116') {
        reportSyncError({
          operation: 'SELECT',
          table: 'admin_passcode',
          message: passErr.message,
          code: passErr.code,
          details: passErr.details,
          hint: passErr.hint,
        });
      } else if (passRows && passRows.length > 0 && passRows[0].passcode) {
        this.db.adminPasscode = passRows[0].passcode;
      } else {
        await asyncSupabase('SEED', 'admin_passcode', supabase.from('admin_passcode').insert({ passcode: this.db.adminPasscode }));
      }

      // 4. Fetch Duty Ratio Matrix (safe query for both integer PK or text PK)
      const { data: ratioRows, error: ratioErr } = await supabase.from('duty_ratio_matrix').select('*').limit(1);
      if (ratioErr && ratioErr.code !== 'PGRST116') {
        reportSyncError({
          operation: 'SELECT',
          table: 'duty_ratio_matrix',
          message: ratioErr.message,
          code: ratioErr.code,
          details: ratioErr.details,
          hint: ratioErr.hint,
        });
      } else if (ratioRows && ratioRows.length > 0) {
        const matrixData = ratioRows[0].matrix_data || ratioRows[0].matrixData;
        if (matrixData) {
          saveDutyMatrix(matrixData);
        }
      }

      // 5. Fetch Activity History
      const { data: actData, error: actErr } = await supabase.from('activity_history').select('*').order('timestamp', { ascending: false }).limit(100);
      if (actErr) {
        reportSyncError({
          operation: 'SELECT',
          table: 'activity_history',
          message: actErr.message,
          code: actErr.code,
          details: actErr.details,
          hint: actErr.hint,
        });
      } else if (actData && actData.length > 0) {
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
      lastSyncStatus = 'connected';
      lastSyncTime = new Date().toLocaleTimeString();
      broadcastSyncState();
    } catch (e: any) {
      console.error('❌ Exception during Supabase synchronization:', e);
      reportSyncError({
        operation: 'SYNC_ALL',
        table: 'all',
        message: e?.message || String(e),
      });
    } finally {
      this.isSupabaseSyncing = false;
      broadcastSyncState();
    }
  }

  private saveToStorage(dbToSave: LocalStorageDB = this.db, notify: boolean = true, pushToD1: boolean = true) {
    try {
      dbToSave.lastUpdated = new Date().toISOString();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbToSave));
      }
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }

    if (pushToD1) {
      this.saveToD1(dbToSave);
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

    // Persist activity to Supabase with schema-safe columns
    const supabase = getSupabase();
    if (supabase) {
      const payload = {
        id: item.id,
        action: item.actionType, // PostgreSQL column 'action' NOT NULL
        action_type: item.actionType,
        airman_id: item.airmanId,
        airman_name: item.airmanName,
        airman_rank: item.airmanRank || null,
        airman_trade: item.airmanTrade || null,
        duty_code: item.dutyCode || null,
        ida_shift: item.idaShift || null,
        from_date: item.fromDate || null,
        to_date: item.toDate || null,
        notes: item.notes || null,
        previous_assignments: item.previousAssignments ? JSON.stringify(item.previousAssignments) : null,
        timestamp: item.timestamp,
      };
      asyncSupabase(
        'INSERT',
        'activity_history',
        supabase.from('activity_history').insert(payload),
        payload,
        'insert'
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
        'INSERT',
        'airmen',
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
      asyncSupabase('BULK_INSERT', 'airmen', supabase.from('airmen').insert(supabaseRows));
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
        'UPDATE',
        'airmen',
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
      asyncSupabase('DELETE', 'airmen', supabase.from('airmen').delete().eq('id', id));
      asyncSupabase('DELETE', 'assignments', supabase.from('assignments').delete().eq('airman_id', id));
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
      const payload = {
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
      };
      asyncSupabase(
        'UPSERT',
        'assignments',
        supabase.from('assignments').upsert(payload),
        payload,
        'upsert'
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
      } else if (dutyCode === 'AIRPORT' || dutyCode === 'AIRFIELD_DUTY') {
        index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr && (a.dutyCode === 'AIRPORT' || a.dutyCode === 'AIRFIELD_DUTY'));
        if (index < 0) {
          index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr);
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
      asyncSupabase('UPSERT_RANGE', 'assignments', supabase.from('assignments').upsert(supabaseRows), supabaseRows, 'upsert');
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
        } else if (dutyCode === 'AIRPORT' || dutyCode === 'AIRFIELD_DUTY') {
          index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr && (a.dutyCode === 'AIRPORT' || a.dutyCode === 'AIRFIELD_DUTY'));
          if (index < 0) {
            index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr);
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
      asyncSupabase('BATCH_UPSERT', 'assignments', supabase.from('assignments').upsert(supabaseRows), supabaseRows, 'upsert');
    }

    return { count: assignments.length * assignedDates.length, assignedDates };
  }

  public deleteAssignment(airmanId: string, date: string, dutyCode?: DutyCategoryCode): boolean {
    const monthKey = date.slice(0, 7);
    if (!this.db.assignments[monthKey]) return false;

    const list = this.db.assignments[monthKey];
    let removed = false;

    if (dutyCode) {
      const idx = list.findIndex((a) => {
        if (a.airmanId !== airmanId || a.date !== date) return false;
        if (dutyCode === 'AIRPORT' || dutyCode === 'AIRFIELD_DUTY') {
          return a.dutyCode === 'AIRPORT' || a.dutyCode === 'AIRFIELD_DUTY';
        }
        if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
          return a.dutyCode === 'IDAC' || a.dutyCode === 'IDA';
        }
        return a.dutyCode === dutyCode;
      });
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
        const deleteCodes = dutyCode
          ? (dutyCode === 'AIRPORT' || dutyCode === 'AIRFIELD_DUTY' ? ['AIRPORT', 'AIRFIELD_DUTY'] : [dutyCode])
          : null;

        if (deleteCodes) {
          asyncSupabase('DELETE', 'assignments', supabase.from('assignments').delete().eq('airman_id', airmanId).eq('date', date).in('duty_code', deleteCodes));
        } else {
          asyncSupabase('DELETE', 'assignments', supabase.from('assignments').delete().eq('airman_id', airmanId).eq('date', date));
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

  public resetToEmptyRoster(): void {
    this.db.assignments = {};
    this.saveToStorage();
    const supabase = getSupabase();
    if (supabase) {
      asyncSupabase('DELETE_ALL', 'assignments', supabase.from('assignments').delete().neq('id', '___empty___'));
    }
  }

  public clearMonth(monthKey: string): void {
    if (this.db.assignments[monthKey]) {
      delete this.db.assignments[monthKey];
      this.saveToStorage();
      const supabase = getSupabase();
      if (supabase) {
        asyncSupabase('DELETE_MONTH', 'assignments', supabase.from('assignments').delete().like('date', `${monthKey}%`));
      }
    }
  }

  public resetToOfficialData(): void {
    this.db.assignments = {
      '2026-07': generateOfficialMonthAssignments(2026, 7),
      '2026-08': generateOfficialMonthAssignments(2026, 8),
    };
    this.saveToStorage();
  }

  // --- PARADE STATE & PT STATE ---
  public getParadeState(params?: {
    date?: string;
    shift?: ParadeShift;
    flight?: FlightName | 'Overall';
    stateType?: string;
  }): ParadeStateResponse {
    const today = new Date().toISOString().split('T')[0];
    const date = params?.date || today;
    const shift = (params?.shift || 'Morning') as ParadeShift;
    const selectedFlight = params?.flight || 'Overall';
    const stateType = (params?.stateType || 'PARADE').toUpperCase();
    const isPT = stateType === 'PT';

    const monthKey = date.slice(0, 7);
    const monthAssignments = this.db.assignments[monthKey] || [];
    const dateAssignments = monthAssignments.filter((a) => a.date === date);

    const assignmentMap = new Map<string, DutyAssignment>();
    dateAssignments.forEach((a) => assignmentMap.set(a.airmanId, a));

    // Calculate yesterday's assignments for auto duty off calculation safely via UTC
    const getYesterdayDateStr = (dateStr: string): string => {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) return dateStr;
      const d = new Date(Date.UTC(year, month - 1, day));
      d.setUTCDate(d.getUTCDate() - 1);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const da = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };

    const yestStr = getYesterdayDateStr(date);
    const yestMonthKey = yestStr.slice(0, 7);
    const yestAssignments = (this.db.assignments[yestMonthKey] || []).filter((a) => a.date === yestStr);
    const yestMap = new Map<string, DutyAssignment>();
    yestAssignments.forEach((a) => yestMap.set(a.airmanId, a));

    // Target airmen filter
    const allAirmen = this.db.airmen || [];
    const filteredAirmen = selectedFlight === 'Overall' 
      ? allAirmen 
      : allAirmen.filter((a) => a.flightName === selectedFlight);

    let onParade = 0;
    let onDuty = 0;
    let onLeave = 0;
    let tdy = 0;
    let otherOff = 0;
    let bakeNBite = 0;

    const resolveEffectiveAssignment = (airmanId: string): { 
      dutyCode: string; 
      idaShift?: string; 
      proxyForFlight?: string;
      disposalScope?: 'ALL' | 'PARADE' | 'PT';
      notes: string; 
      dutyName: string;
      previousDutyName?: string;
      statusCategory: string;
    } => {
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
              const hadDutyYesterday = yestAss && (
                ['GD', 'BTF', 'NTF', 'AIRPORT', 'HALISHAHAR'].includes(yestAss.dutyCode) ||
                ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night')
              );
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
        }
        else if (codeStr === 'BAKE_N_BITE') {
          dutyName = 'Bake N Bite';
          statusCategory = 'BAKE_N_BITE';
        }
        else if (codeStr === 'LEAVE') {
          dutyName = ass.notes?.includes('Annual') || ass.notes?.includes('AL') ? 'Annual Leave (AL)' : 'Casual Leave (CL)';
          statusCategory = 'LEAVE';
        }
        else if (codeStr === 'TDY') {
          dutyName = 'TDY / Attachment';
          statusCategory = 'TDY';
        }
        else if (codeStr === 'DUTY_OFF') {
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
            else if (yestAss.notes?.toLowerCase().includes('idac') || yestAss.previousDutyName?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
            else if (yestCodeStr === 'DUTY_OFF') offShort = yestAss.previousDutyName || 'GD Off';
            else offShort = `${yestAss.dutyCode} Off`;
          } else if (ass.notes && !ass.notes.toLowerCase().includes('imported')) {
            if (ass.notes.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
            else if (ass.notes.toLowerCase().includes('gd')) offShort = 'GD Off';
            else if (ass.notes.toLowerCase().includes('btf')) offShort = 'BTF Off';
            else if (ass.notes.toLowerCase().includes('ntf')) offShort = 'NTF Off';
            else if (ass.notes.toLowerCase().includes('airport')) offShort = 'Airport Off';
            else if (ass.notes.toLowerCase().includes('halishahar')) offShort = 'Halishahar Off';
            else offShort = ass.notes;
          }

          offShort = offShort
            .replace(/DUTY_OFF/g, 'Duty')
            .replace(/Off Off/g, 'Off')
            .replace(/Duty Off Off/g, 'Duty Off');

          if (!offShort.toLowerCase().endsWith('off')) {
            offShort = `${offShort} Off`;
          }

          previousDutyName = offShort;
          dutyName = offShort;
          statusCategory = 'OFF';
        }
        else if (codeStr === 'ON_PARADE') {
          dutyName = isPT ? 'On PT' : 'On Parade';
          statusCategory = 'PARADE';
        }
        else if (codeStr === 'ESSN') {
          dutyName = 'Essential Task';
          statusCategory = 'ESSN';
        }
        else if (codeStr === 'CMH') {
          dutyName = 'BNS/BSH/CMH';
          statusCategory = 'CMH';
        }
        else if (codeStr === 'SICK_REPORT') {
          dutyName = 'Sick Report';
          statusCategory = 'SICK_REPORT';
        }
        else if (codeStr === 'DRILL_CAT_C') {
          dutyName = 'Drill Cat-C';
          statusCategory = 'DRILL_CAT_C';
        }
        else if (codeStr === 'ADMIN_ORDER') {
          dutyName = 'Admin Order';
          statusCategory = 'ADMIN_ORDER';
        }
        else if (codeStr === 'CLASS_TRG') {
          dutyName = 'Class / Training';
          statusCategory = 'CLASS_TRG';
        }
        else if (codeStr === 'AIRFIELD_DUTY') {
          dutyName = 'Airfield Duty';
          statusCategory = 'AIRFIELD_DUTY';
        }
        else if (codeStr === 'RECEPTION') {
          dutyName = 'K/O & Reception';
          statusCategory = 'RECEPTION';
        }
        else if (codeStr === 'GAMES') {
          dutyName = 'G/H & Games';
          statusCategory = 'GAMES';
        }
        else if (codeStr === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }

        const safeNotes = (ass.notes || '').toLowerCase().includes('imported') ? '' : (ass.notes || '');

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
          else if (yestAss.notes?.toLowerCase().includes('idac') || yestAss.previousDutyName?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
          else if (yestAss.dutyCode === 'DUTY_OFF') offShort = yestAss.previousDutyName || yestAss.notes || 'Duty Off';
          else offShort = `${yestAss.dutyCode} Off`;

          offShort = offShort
            .replace(/DUTY_OFF/g, 'Duty')
            .replace(/Off Off/g, 'Off')
            .replace(/Duty Off Off/g, 'Duty Off');

          const isHeavy =
            ['GD', 'BTF', 'NTF', 'AIRPORT', 'HALISHAHAR', 'DUTY_OFF'].includes(yestAss.dutyCode) ||
            ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') ||
            yestAss.notes?.toLowerCase().includes('idac');

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

      if ((dutyCode === 'IDAC' || dutyCode === 'IDA') && idaShift === 'Night') {
        const shiftNote = 'IDAC Night';
        if (!notes) notes = shiftNote;
        else if (!notes.includes('IDAC')) notes = `${shiftNote} - ${notes}`;
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
      const flAirmen = (this.db.airmen || []).filter((a) => a.flightName === fl);
      let flParade = 0;
      let flDuty = 0;
      let flLeave = 0;
      let flTdy = 0;
      let flOff = 0;
      let flBakeNBite = 0;

      flAirmen.forEach((a) => {
        const eff = resolveEffectiveAssignment(a.id);
        if (eff.dutyCode === 'BAKE_N_BITE' || eff.statusCategory === 'BAKE_N_BITE') {
          flBakeNBite++;
        } else if (eff.statusCategory === 'LEAVE' || eff.dutyCode === 'LEAVE') flLeave++;
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
    const trimmed = (code || '').trim();
    const stored = (this.db.adminPasscode || DEFAULT_ADMIN_PASSCODE).trim();
    return trimmed === stored || trimmed === DEFAULT_ADMIN_PASSCODE;
  }

  public changePasscode(current: string, newCode: string): boolean {
    if (this.verifyPasscode(current) && newCode && newCode.length === 4) {
      this.db.adminPasscode = newCode;
      this.saveToStorage();

      // Persist to Supabase
      const supabase = getSupabase();
      if (supabase) {
        // Fetch existing record ID if any, or update first record
        Promise.resolve(supabase.from('admin_passcode').select('id').limit(1))
          .then(({ data }) => {
            if (data && data.length > 0 && data[0].id !== undefined) {
              asyncSupabase('UPDATE', 'admin_passcode', supabase.from('admin_passcode').update({ passcode: newCode }).eq('id', data[0].id));
            } else {
              asyncSupabase('INSERT', 'admin_passcode', supabase.from('admin_passcode').insert({ passcode: newCode }));
            }
          })
          .catch((err: any) => {
            console.error('Failed to persist admin passcode to Supabase:', err);
          });
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
      Promise.resolve(supabase.from('duty_ratio_matrix').select('id').limit(1))
        .then(({ data }) => {
          if (data && data.length > 0 && data[0].id !== undefined) {
            asyncSupabase(
              'UPDATE',
              'duty_ratio_matrix',
              supabase
                .from('duty_ratio_matrix')
                .update({
                  matrix_data: matrix,
                  updated_by: updatedBy,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', data[0].id)
            );
          } else {
            asyncSupabase(
              'INSERT',
              'duty_ratio_matrix',
              supabase.from('duty_ratio_matrix').insert({
                matrix_data: matrix,
                updated_by: updatedBy,
              })
            );
          }
        })
        .catch((err: any) => {
          console.error('Failed to persist duty ratio matrix to Supabase:', err);
        });
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

  // --- FUZZY AIRMAN MATCHER (RANK FIRST) ---
  private findBestAirmanMatch(rawText: string, flightHint?: FlightName | 'Overall'): { airman: Airman | null; confidence: number } {
    return matchAirmanRankFirst(rawText, this.db.airmen, flightHint);
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

    for (const f of fileList) {
      if (f.base64) {
        const isPdf = (f.mime && f.mime.includes('pdf')) || (f.name && f.name.toLowerCase().endsWith('.pdf'));
        const isText = (f.mime && (f.mime.includes('text') || f.mime.includes('csv') || f.mime.includes('json'))) ||
          (f.name && /\.(txt|csv|tsv|json)$/i.test(f.name));

        if (isText) {
          try {
            const clean = f.base64.replace(/^data:[^;]+;base64,/, '');
            const decoded = atob(clean);
            extractedText += `\n${decoded}`;
          } catch {
            // Ignore decode error
          }
        } else if (isPdf) {
          const pdfText = this.extractTextFromPdfBase64(f.base64);
          if (pdfText) extractedText += `\n${pdfText}`;
        }
      }
    }

    if (!extractedText.trim()) {
      throw new Error('No readable text could be extracted from the uploaded file(s). Please paste table text directly in the "Paste Text / OCR" tab.');
    }

    // Run heuristic parser strictly on the user's extracted content
    const parsedResult = parseRosterTextHeuristically(
      extractedText,
      targetYear,
      targetFlight,
      this.db.airmen
    );

    if (!parsedResult.dates || parsedResult.dates.length === 0) {
      throw new Error('Could not identify any duty dates or airman assignments from the provided input. Please verify that your file or text contains dates (e.g. 01 Aug) and duty columns.');
    }

    return {
      ...parsedResult,
      totalPages: Math.max(fileList.length, 1),
      totalFiles: fileList.length,
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
        asyncSupabase('UPSERT_IMPORT', 'assignments', supabase.from('assignments').upsert(supabaseRows));
      }
      asyncSupabase(
        'INSERT',
        'import_history',
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
      asyncSupabase('DELETE', 'import_history', supabase.from('import_history').delete().eq('id', batchId));
    }

    return true;
  }

  /**
   * Diagnostic round-trip write & read test for Supabase
   */
  public async testSupabaseWriteRead(airmanData?: Partial<Airman>): Promise<{
    success: boolean;
    operation: string;
    insertedRecord?: any;
    readBackRecord?: any;
    error?: any;
    diagnostics: ReturnType<typeof getSupabaseConfigDiagnostics>;
  }> {
    const diagnostics = getSupabaseConfigDiagnostics();
    const supabase = getSupabase();

    if (!supabase || !diagnostics.isConfigured) {
      return {
        success: false,
        operation: 'INITIALIZE',
        error: { message: diagnostics.statusMessage },
        diagnostics,
      };
    }

    const testId = `test-sync-${Date.now()}`;
    const payload = {
      id: testId,
      ser_no: 9999,
      code: 'TEST-AIR',
      bd_no: `BD/${Date.now().toString().slice(-6)}`,
      rank: 'LAC',
      name: airmanData?.name || 'Diagnostic Sync Test Airman',
      trade: 'Avionic Tech',
      address_block: 'Test Block',
      mobile_no: '01700000000',
      flight_name: 'Avionics',
      remarks: 'Automated Supabase Verification Test',
      active: true,
    };

    try {
      console.log('🧪 [Supabase Test] Initiating test insert into `airmen` table:', payload);
      // 1. Insert
      let insertRes = await supabase.from('airmen').insert(payload);
      if (insertRes.error) {
        // Retry with camelCase payload
        const camelPayload = adaptRowForTable('airmen', payload, 'camel');
        const retryRes = await supabase.from('airmen').insert(camelPayload);
        if (!retryRes.error) {
          insertRes = retryRes;
        }
      }

      if (insertRes.error) {
        console.error('❌ [Supabase Test] Insert failed:', insertRes.error);
        reportSyncError({
          operation: 'TEST_INSERT',
          table: 'airmen',
          message: insertRes.error.message,
          code: insertRes.error.code,
          details: insertRes.error.details,
          hint: insertRes.error.hint,
        });
        return {
          success: false,
          operation: 'INSERT',
          error: insertRes.error,
          diagnostics,
        };
      }

      console.log('✅ [Supabase Test] Insert succeeded. Reading back from `airmen` table...');
      // 2. Read back
      const readRes = await supabase.from('airmen').select('*').eq('id', testId).single();
      if (readRes.error) {
        console.error('❌ [Supabase Test] Read back failed:', readRes.error);
        reportSyncError({
          operation: 'TEST_READ_BACK',
          table: 'airmen',
          message: readRes.error.message,
          code: readRes.error.code,
        });
        return {
          success: false,
          operation: 'READ_BACK',
          insertedRecord: payload,
          error: readRes.error,
          diagnostics,
        };
      }

      console.log('✅ [Supabase Test] Read back verified successfully:', readRes.data);
      // 3. Clean up test record
      await supabase.from('airmen').delete().eq('id', testId);
      console.log('🧹 [Supabase Test] Cleaned up temporary test record.');

      reportSyncSuccess('TEST_ROUND_TRIP', 'airmen');
      return {
        success: true,
        operation: 'ROUND_TRIP_VERIFIED',
        insertedRecord: payload,
        readBackRecord: readRes.data,
        diagnostics,
      };
    } catch (err: any) {
      console.error('❌ [Supabase Test] Exception during test write/read:', err);
      reportSyncError({
        operation: 'TEST_EXCEPTION',
        table: 'airmen',
        message: err?.message || String(err),
      });
      return {
        success: false,
        operation: 'EXCEPTION',
        error: { message: err?.message || String(err) },
        diagnostics,
      };
    }
  }
}

// Global Singleton Instance
export const localDb = new LocalDatabaseEngine();
