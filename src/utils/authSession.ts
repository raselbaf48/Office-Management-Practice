import { Airman } from '../types';

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
 * Get current active user session
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

  // Record into history log
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
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserLoginLog[];
  } catch {
    return [];
  }
};

/**
 * Add a record to login history
 */
export const recordLoginLog = (airman: Airman): void => {
  try {
    const nowIso = new Date().toISOString();
    const existing = getLoginHistory();

    const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
    const newLog: UserLoginLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bdNo: `BD/${cleanBd}`,
      rank: airman.rank,
      name: airman.name,
      flightName: airman.flightName,
      timestamp: nowIso,
      timeFormatted: formatLogTime(nowIso),
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop / Web Workstation',
    };

    // Keep up to 200 most recent logs
    const updated = [newLog, ...existing].slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record login log:', e);
  }
};

/**
 * Clear all login logs
 */
export const clearLoginHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear login history:', e);
  }
};
