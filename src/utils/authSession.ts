import { Airman } from '../types';
import { getSupabase } from '../services/supabaseClient';

export interface UserLoginLog {
  id: string;
  bdNo: string;
  rank: string;
  name: string;
  flightName: string;
  timestamp: string;
  timeFormatted: string;
  deviceInfo: string;
}

export interface UserSession {
  airmanId: string;
  bdNo: string;
  rank: string;
  name: string;
  flightName: string;
  trade: string;
  loginTimestamp: string;
}

const SESSION_KEY = 'baf_user_session';
const HISTORY_KEY = 'baf_user_login_history';

// In-memory cache of login history
let cachedLoginHistory: UserLoginLog[] = [];

/**
 * Format timestamp nicely
 */
export const formatLogTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

/**
 * Get current active user session (Client device local session)
 */
export const getCurrentUserSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
};

/**
 * Record a user login and save session
 */
export const setUserSession = (airman: Airman): UserSession => {
  const session: UserSession = {
    airmanId: airman.id,
    bdNo: airman.bdNo.replace(/^BD\/?/i, '').trim(),
    rank: airman.rank,
    name: airman.name,
    flightName: airman.flightName,
    trade: airman.trade,
    loginTimestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }

  // Record into history log in Supabase & local cache
  recordLoginLog(airman);

  // Dispatch event
  window.dispatchEvent(new CustomEvent('baf_user_session_changed', { detail: session }));

  return session;
};

/**
 * Clear user session (Logout)
 */
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('baf_user_role');
  } catch (e) {
    console.error('Failed to clear user session:', e);
  }
  window.dispatchEvent(new CustomEvent('baf_user_session_changed', { detail: null }));
};

/**
 * Retrieve all login history entries
 */
export const getLoginHistory = (): UserLoginLog[] => {
  if (cachedLoginHistory.length > 0) {
    return cachedLoginHistory;
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      cachedLoginHistory = JSON.parse(raw) as UserLoginLog[];
      return cachedLoginHistory;
    }
  } catch {
    // fallback
  }
  return [];
};

/**
 * Asynchronously fetch login history from Supabase user_login_history table
 */
export const fetchLoginHistoryFromSupabase = async (): Promise<UserLoginLog[]> => {
  const supabase = getSupabase();
  if (!supabase) {
    return getLoginHistory();
  }

  try {
    const { data, error } = await supabase
      .from('user_login_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(300);

    if (error) {
      console.warn('Supabase fetch user_login_history error:', error.message);
      return getLoginHistory();
    }

    if (data && Array.isArray(data)) {
      const mapped: UserLoginLog[] = data.map((row) => ({
        id: row.id,
        bdNo: row.bd_no || row.bdNo,
        rank: row.rank,
        name: row.name,
        flightName: row.flight_name || row.flightName,
        timestamp: row.timestamp,
        timeFormatted: row.time_formatted || row.timeFormatted || formatLogTime(row.timestamp),
        deviceInfo: row.device_info || row.deviceInfo || 'Desktop / Web Workstation',
      }));
      cachedLoginHistory = mapped;
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(mapped));
      } catch {}
      return mapped;
    }
  } catch (err) {
    console.warn('Could not load user_login_history from Supabase:', err);
  }

  return getLoginHistory();
};

/**
 * Add a record to login history (Writes to Supabase + local cache)
 */
export const recordLoginLog = async (airman: Airman): Promise<void> => {
  try {
    const nowIso = new Date().toISOString();
    const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
    const newLog: UserLoginLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bdNo: `BD/${cleanBd}`,
      rank: airman.rank,
      name: airman.name,
      flightName: airman.flightName,
      timestamp: nowIso,
      timeFormatted: formatLogTime(nowIso),
      deviceInfo: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Web Workstation',
    };

    // Update in-memory & local cache immediately
    const existing = getLoginHistory();
    cachedLoginHistory = [newLog, ...existing.filter(item => item.id !== newLog.id)].slice(0, 300);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(cachedLoginHistory));
    } catch {}

    // Persist to Supabase user_login_history table
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase
          .from('user_login_history')
          .insert({
            id: newLog.id,
            bd_no: newLog.bdNo,
            rank: newLog.rank,
            name: newLog.name,
            flight_name: newLog.flightName,
            timestamp: newLog.timestamp,
            time_formatted: newLog.timeFormatted,
            device_info: newLog.deviceInfo,
          })
      )
        .then(({ error }: any) => {
          if (error) {
            console.warn('Supabase user_login_history insert warning:', error.message);
          }
        })
        .catch((err: any) => {
          console.warn('Supabase log insert error:', err);
        });
    }
  } catch (e) {
    console.error('Failed to record login log:', e);
  }
};

/**
 * Clear all login logs
 */
export const clearLoginHistory = async (): Promise<void> => {
  cachedLoginHistory = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear login history locally:', e);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('user_login_history').delete().neq('id', '___non_existent___');
    } catch (e) {
      console.warn('Supabase clear login history error:', e);
    }
  }
};

// Initial background fetch
if (typeof window !== 'undefined') {
  fetchLoginHistoryFromSupabase().catch(() => {});
}

