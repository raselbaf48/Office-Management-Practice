import { logUserLogin, updatePresence } from '../services/presenceService';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus } from '../types';

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
  flightName?: string;
  trade?: string;
  loginTimestamp: string;
  assignedRole?: string;
  adminPass?: string;
  ownerPass?: string;
}

const SESSION_KEY = 'baf_user_session';
const HISTORY_KEY = 'baf_user_login_history';
const DETAILED_USERS_KEY = 'baf_detailed_user_logins';

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
 * Get all detailed/authorized login users
 */
export const getDetailedUsers = (nominalAirmen: Airman[] = []): DetailedUserLogin[] => {
  try {
    const raw = localStorage.getItem(DETAILED_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DetailedUserLogin[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse detailed user logins:', e);
  }

  // If none configured yet, populate with nominal roll airmen (default 474455 as primary active)
  if (nominalAirmen.length > 0) {
    const defaults: DetailedUserLogin[] = nominalAirmen.map((a) => {
      const cleanBd = a.bdNo.replace(/^BD\/?/i, '').trim();
      const isPrimary = cleanBd === '474455';
      return {
        id: `user-login-${cleanBd}`,
        airmanId: a.id,
        bdNo: cleanBd,
        rank: a.rank,
        name: a.name,
        flightName: a.flightName,
        trade: a.trade,
        role: isPrimary ? 'SUPER_ADMIN' : 'USER',
        password: cleanBd,
        status: 'ACTIVE',
        detailOrder: isPrimary ? 'DO-155/ADMIN/01' : 'DO-155/GEN/2026',
        detailedAt: new Date().toISOString(),
        detailedBy: '155 UASU Admin',
        remarks: isPrimary ? 'Primary System Admin User (BD/474455 LAC Rasel)' : 'Nominal Roll Detailed User',
      };
    });

    try {
      localStorage.setItem(DETAILED_USERS_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  // Fallback single primary user
  const primaryFallback: DetailedUserLogin[] = [
    {
      id: 'user-login-474455',
      bdNo: '474455',
      rank: 'LAC',
      name: 'Rasel',
      flightName: 'Avionics',
      trade: 'E&I Fitt',
      role: 'SUPER_ADMIN',
      password: '474455',
      status: 'ACTIVE',
      detailOrder: 'DO-155/ADMIN/01',
      detailedAt: new Date().toISOString(),
      detailedBy: '155 UASU Unit HQ',
      remarks: 'Primary Admin User ID (LAC Rasel)',
    },
  ];
  return primaryFallback;
};

/**
 * Save detailed user logins
 */
export const saveDetailedUsers = (users: DetailedUserLogin[]): void => {
  try {
    localStorage.setItem(DETAILED_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('baf_detailed_users_changed', { detail: users }));
  } catch (e) {
    console.error('Failed to save detailed user logins:', e);
  }
};

/**
 * Detail an individual airman for user login
 */
export const detailAirmanForLogin = (
  airman: Airman,
  role: UserLoginRole = 'USER',
  status: UserLoginStatus = 'ACTIVE',
  detailOrder: string = '',
  remarks: string = ''
): DetailedUserLogin => {
  const current = getDetailedUsers();
  const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();

  const existingIndex = current.findIndex(
    (u) => u.bdNo.toLowerCase() === cleanBd.toLowerCase() || (u.airmanId && u.airmanId === airman.id)
  );

  const newEntry: DetailedUserLogin = {
    id: existingIndex >= 0 ? current[existingIndex].id : `user-login-${cleanBd}-${Date.now()}`,
    airmanId: airman.id,
    bdNo: cleanBd,
    rank: airman.rank,
    name: airman.name,
    flightName: airman.flightName,
    trade: airman.trade,
    role,
    status,
    detailOrder: detailOrder.trim() || `DO-155/DTL/${cleanBd}`,
    detailedAt: new Date().toISOString(),
    detailedBy: '155 UASU Admin',
    remarks: remarks.trim() || `Detailed from Nominal Roll (${airman.rank} ${airman.name})`,
    lastLoginAt: existingIndex >= 0 ? current[existingIndex].lastLoginAt : undefined,
  };

  if (existingIndex >= 0) {
    current[existingIndex] = newEntry;
  } else {
    current.unshift(newEntry);
  }

  saveDetailedUsers(current);
  return newEntry;
};

/**
 * Batch detail all airmen from nominal roll
 */
export const batchDetailAllAirmen = (airmen: Airman[]): DetailedUserLogin[] => {
  const current = getDetailedUsers();
  const updatedList: DetailedUserLogin[] = [...current];

  airmen.forEach((airman) => {
    const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
    const idx = updatedList.findIndex((u) => u.bdNo.toLowerCase() === cleanBd.toLowerCase());
    const isPrimary = cleanBd === '474455';

    const entry: DetailedUserLogin = {
      id: idx >= 0 ? updatedList[idx].id : `user-login-${cleanBd}`,
      airmanId: airman.id,
      bdNo: cleanBd,
      rank: airman.rank,
      name: airman.name,
      flightName: airman.flightName,
      trade: airman.trade,
      role: idx >= 0 ? updatedList[idx].role : (isPrimary ? 'SUPER_ADMIN' : 'USER'),
      password: idx >= 0 && updatedList[idx].password ? updatedList[idx].password : cleanBd,
      status: idx >= 0 ? updatedList[idx].status : 'ACTIVE',
      detailOrder: idx >= 0 && updatedList[idx].detailOrder ? updatedList[idx].detailOrder : `DO-155/NR/${cleanBd}`,
      detailedAt: idx >= 0 ? updatedList[idx].detailedAt : new Date().toISOString(),
      detailedBy: '155 UASU HQ Batch Detail',
      remarks: idx >= 0 && updatedList[idx].remarks ? updatedList[idx].remarks : `Detailed from Nominal Roll (${airman.flightName} Flight)`,
      lastLoginAt: idx >= 0 ? updatedList[idx].lastLoginAt : undefined,
    };

    if (idx >= 0) {
      updatedList[idx] = entry;
    } else {
      updatedList.push(entry);
    }
  });

  saveDetailedUsers(updatedList);
  return updatedList;
};

/**
 * Remove or Revoke login access for a BD number
 */
export const removeDetailedUser = (bdNo: string): void => {
  const clean = bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const filtered = current.filter((u) => u.bdNo.toLowerCase() !== clean);
  saveDetailedUsers(filtered);
};

/**
 * Toggle active / suspended / disabled status
 */
export const toggleUserLoginStatus = (bdNo: string, newStatus: UserLoginStatus): DetailedUserLogin | null => {
  const clean = bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const idx = current.findIndex((u) => u.bdNo.toLowerCase() === clean);
  if (idx === -1) return null;

  current[idx].status = newStatus;
  saveDetailedUsers(current);
  return current[idx];
};

/**
 * Validate User Login Attempt
 */
export const validateUserLogin = (
  bdInput: string,
  passwordInput: string,
  nominalAirmen: Airman[]
): { success: boolean; airman?: Airman; detailedUser?: DetailedUserLogin; message: string } => {
  const cleanInput = bdInput.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
  if (!cleanInput) {
    return { success: false, message: 'Please enter your User ID.' };
  }

  // 1. Check detailed users register first
  const detailedList = getDetailedUsers(nominalAirmen);
  const matchedDetail = detailedList.find((u) => u.bdNo.toLowerCase() === cleanInput);

  if (matchedDetail) {
    // Password Verification
    const expectedPassword = matchedDetail.password || matchedDetail.bdNo;
    if (passwordInput !== expectedPassword) {
      return { success: false, message: 'Invalid User ID or Password. Please try again.' };
    }
    if (matchedDetail.status === 'DISABLED') {
      return {
        success: false,
        message: 'You are not authorized to access the portal. User ID is disabled. Please contact administrator.',
      };
    }
    if (matchedDetail.status === 'SUSPENDED') {
      return {
        success: false,
        message: 'You are not authorized to access the portal. User ID is temporarily suspended.',
      };
    }

    // Find corresponding airman or construct one
    let airman = nominalAirmen.find(
      (a) => a.bdNo.trim().replace(/^BD\/?/i, '').toLowerCase() === cleanInput || a.id === matchedDetail.airmanId
    );

    if (!airman) {
      airman = {
        id: matchedDetail.airmanId || `airman-${matchedDetail.bdNo}`,
        serNo: 99,
        code: `${matchedDetail.rank}-${matchedDetail.name.slice(0, 3).toUpperCase()}`,
        bdNo: `BD/${matchedDetail.bdNo}`,
        rank: matchedDetail.rank as any,
        name: matchedDetail.name,
        trade: matchedDetail.trade || 'General',
        addressBlock: '155 UASU',
        mobileNo: '',
        flightName: (matchedDetail.flightName as any) || 'Admin',
        remarks: matchedDetail.remarks || '',
        active: true,
      };
    }

    // Update lastLoginAt
    matchedDetail.lastLoginAt = new Date().toISOString();
    saveDetailedUsers(detailedList);

    return {
      success: true,
      airman,
      detailedUser: matchedDetail,
      message: `Access granted for ${matchedDetail.rank} ${matchedDetail.name}`,
    };
  }

  // 2. If not explicitly in detailed list, check nominal roll
  const matchedAirman = nominalAirmen.find((a) => {
    const airmanBd = a.bdNo.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
    return airmanBd === cleanInput;
  });

  if (matchedAirman) {
    // For auto-detailed airman, password is their BD No
    const expectedPassword = matchedAirman.bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
    if (passwordInput.trim().toLowerCase() !== expectedPassword) {
      return { success: false, message: 'Invalid User ID or Password. Please try again.' };
    }
    // Auto-detail this airman and allow login
    const isPrimary = cleanInput === '474455';
    const newDetail = detailAirmanForLogin(
      matchedAirman,
      isPrimary ? 'SUPER_ADMIN' : 'USER',
      'ACTIVE',
      `DO-155/AUTO/${matchedAirman.bdNo}`,
      'Automatic Detail on Nominal Match'
    );

    return {
      success: true,
      airman: matchedAirman,
      detailedUser: newDetail,
      message: `Welcome, ${matchedAirman.rank} ${matchedAirman.name}`,
    };
  }

  return {
    success: false,
    message: 'You are not authorized to access the portal. User ID error, please enter correct User ID.',
  };
};

/**
 * Record a user login and save session
 */
export const setUserSession = (airman: Airman, assignedRole: UserLoginRole = 'USER', detailedUser?: DetailedUserLogin): UserSession => {
  const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
  const session: UserSession = {
    airmanId: airman.id,
    bdNo: cleanBd,
    rank: airman.rank,
    name: airman.name,
    flightName: airman.flightName,
    trade: airman.trade,
    loginTimestamp: new Date().toISOString(),
    assignedRole: assignedRole,
    adminPass: detailedUser?.adminPass || (cleanBd === '474455' ? '1124' : undefined),
    ownerPass: detailedUser?.ownerPass
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }

  // Record into history log in local storage & D1
  recordLoginLog(airman);
  // Realtime Presence Sync
  logUserLogin({
    bdNo: airman.bdNo.replace(/^BD\/?/i, '').trim(),
    name: airman.name,
    rank: airman.rank,
    flightName: airman.flightName,
    role: assignedRole
  });

  // Dispatch event
  window.dispatchEvent(new CustomEvent('baf_user_session_changed', { detail: session }));

  return session;
};

/**
 * Clear user session (Logout)
 */
export const clearUserSession = (): void => {
  try {
    
    const session = getCurrentUserSession();
    if (session) {
      updatePresence(session.bdNo, true); // logout
    }
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
 * Add a record to login history
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
    cachedLoginHistory = [newLog, ...existing.filter(item => item.id !== newLog.id)];
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(cachedLoginHistory));
    } catch {}
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
};



/**
 * Change a user's password
 */
export const changeUserPassword = (bdNo: string, currentPass: string, newPass: string, isSuperAdmin: boolean = false): { success: boolean; message: string } => {
  const clean = bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const idx = current.findIndex((u) => u.bdNo.toLowerCase() === clean);
  
  if (idx === -1) {
    return { success: false, message: 'User not found in system.' };
  }

  const expectedPass = current[idx].password || current[idx].bdNo;
  
  if (!isSuperAdmin && currentPass !== expectedPass) {
    return { success: false, message: 'Current password is incorrect.' };
  }

  current[idx].password = newPass;
  saveDetailedUsers(current);
  return { success: true, message: 'Password updated successfully.' };
};

/**
 * Change a user's role
 */
export const changeAdminPassword = (bdNo: string, currentPass: string, newPass: string, isSuperAdmin: boolean = false): { success: boolean; message: string } => {
  const clean = bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const idx = current.findIndex((u) => u.bdNo.toLowerCase() === clean);
  
  if (idx === -1) {
    return { success: false, message: 'User not found in system.' };
  }

  const expectedPass = current[idx].adminPass || (clean === '474455' ? '1124' : '');
  
  if (!isSuperAdmin && currentPass !== expectedPass) {
    return { success: false, message: 'Current admin password is incorrect.' };
  }

  current[idx].adminPass = newPass;
  saveDetailedUsers(current);
  return { success: true, message: 'Admin Password updated successfully.' };
};

export const changeUserRole = (bdNo: string, newRole: UserLoginRole): DetailedUserLogin | null => {
  const clean = bdNo.replace(/^BD\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const idx = current.findIndex((u) => u.bdNo.toLowerCase() === clean);
  
  if (idx === -1) return null;

  current[idx].role = newRole;
  saveDetailedUsers(current);
  return current[idx];
};
