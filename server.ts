import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import { INITIAL_AIRMEN } from './src/data/initialAirmen';
import { DUTY_TYPES } from './src/data/dutyTypes';
import { generateSeedAssignments, calculateDutyStats, detectConflicts } from './src/data/rosterGenerator';
import { generateOfficialMonthAssignments } from './src/data/officialJulyAugustData';
import { Airman, DutyAssignment, FlightName, ParadeShift, ActivityHistoryItem } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'baf_unit_data.json');

interface LocalDB {
  airmen: Airman[];
  assignments: Record<string, DutyAssignment[]>; // monthKey YYYY-MM -> DutyAssignment[]
  activityHistory?: ActivityHistoryItem[];
}

function normalizeFlightName(flight: string): FlightName {
  if (flight === 'Avionic Flight' || flight === 'Avionic') return 'Avionics';
  if (flight === 'Mech Flight' || flight === 'Mech') return 'Mechanics';
  if (flight === 'GCS Flight') return 'GCS';
  if (flight === 'Admin Flight') return 'Admin';
  if (flight === 'Avionics' || flight === 'Mechanics' || flight === 'GCS' || flight === 'Admin') {
    return flight as FlightName;
  }
  return 'Admin';
}

// Ensure data file exists or seed it
function loadDatabase(): LocalDB {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.airmen) && parsed.assignments) {
        // Ensure airmen array is updated to INITIAL_AIRMEN with all 48 airmen details & real mobile numbers
        parsed.airmen = INITIAL_AIRMEN.map((initA) => {
          const existing = parsed.airmen.find((a: Airman) => a.bdNo === initA.bdNo || a.id === initA.id);
          return existing
            ? {
                ...initA,
                ...existing,
                bdNo: initA.bdNo,
                rank: initA.rank,
                name: initA.name,
                trade: initA.trade,
                addressBlock: initA.addressBlock || existing.addressBlock,
                mobileNo: initA.mobileNo || existing.mobileNo,
                flightName: initA.flightName,
              }
            : initA;
        });
        // Preserve existing user assignments; only seed if missing
        if (!parsed.assignments['2026-07'] || parsed.assignments['2026-07'].length === 0) {
          parsed.assignments['2026-07'] = generateOfficialMonthAssignments(2026, 7);
        }
        if (!parsed.assignments['2026-08'] || parsed.assignments['2026-08'].length === 0) {
          parsed.assignments['2026-08'] = generateOfficialMonthAssignments(2026, 8);
        }
        if (!parsed.activityHistory) {
          parsed.activityHistory = [];
        }
        saveDatabase(parsed);
        return parsed as LocalDB;
      }
    } catch (err) {
      console.error('Error reading DB_FILE, re-seeding:', err);
    }
  }

  // Generate initial database
  const db: LocalDB = {
    airmen: [...INITIAL_AIRMEN],
    assignments: {
      '2026-07': generateOfficialMonthAssignments(2026, 7),
      '2026-08': generateOfficialMonthAssignments(2026, 8),
    },
  };

  saveDatabase(db);
  return db;
}

const sseClients = new Set<express.Response>();

function broadcastRealtimeEvent(type: string = 'DATA_UPDATED', payload: any = {}) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

function saveDatabase(db: LocalDB, eventType: string = 'DATA_UPDATED') {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    broadcastRealtimeEvent(eventType);
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let db = loadDatabase();

  // --- API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', unit: '155 UASU BAF', personnelCount: db.airmen.length });
  });

  // Real-time Event Stream (SSE) for instant synchronization across all clients
  app.get('/api/realtime/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Initial connection message
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

    sseClients.add(res);

    // Keep-alive heartbeat every 15 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // 1. Airmen CRUD
  app.get('/api/airmen', (req, res) => {
    const { flight, rank, search } = req.query;
    let list = db.airmen;

    if (flight && flight !== 'Overall') {
      list = list.filter((a) => a.flightName === flight);
    }

    if (rank && rank !== 'All') {
      list = list.filter((a) => a.rank === rank);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.bdNo.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.trade.toLowerCase().includes(q) ||
          a.addressBlock.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.post('/api/airmen', (req, res) => {
    const newAirmanData = req.body;
    if (!newAirmanData.name || !newAirmanData.bdNo || !newAirmanData.flightName) {
      return res.status(400).json({ error: 'Missing required fields: name, bdNo, flightName' });
    }

    const newSerNo = db.airmen.length > 0 ? Math.max(...db.airmen.map((a) => a.serNo)) + 1 : 1;
    const id = `airman-${Date.now()}`;

    const newAirman: Airman = {
      id,
      serNo: newSerNo,
      code: newAirmanData.code || `${newAirmanData.rank}-${newAirmanData.name.slice(0, 3).toUpperCase()}`,
      bdNo: newAirmanData.bdNo,
      rank: newAirmanData.rank || 'LAC',
      name: newAirmanData.name,
      trade: newAirmanData.trade || 'General Tech',
      addressBlock: newAirmanData.addressBlock || 'Barracks',
      mobileNo: newAirmanData.mobileNo || '01700000000',
      flightName: newAirmanData.flightName as FlightName,
      remarks: newAirmanData.remarks || 'Newly Enlisted',
      active: true,
    };

    db.airmen.push(newAirman);
    saveDatabase(db);
    res.status(201).json(newAirman);
  });

  app.put('/api/airmen/:id', (req, res) => {
    const { id } = req.params;
    const index = db.airmen.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Airman not found' });
    }

    db.airmen[index] = {
      ...db.airmen[index],
      ...req.body,
      id, // protect ID
    };

    saveDatabase(db);
    res.json(db.airmen[index]);
  });

  app.delete('/api/airmen/:id', (req, res) => {
    const { id } = req.params;
    const initialCount = db.airmen.length;
    db.airmen = db.airmen.filter((a) => a.id !== id);

    if (db.airmen.length === initialCount) {
      return res.status(404).json({ error: 'Airman not found' });
    }

    saveDatabase(db);
    res.json({ success: true, message: 'Airman removed' });
  });

  // 2. Duty Types
  app.get('/api/duty-types', (req, res) => {
    res.json(DUTY_TYPES);
  });

  // 3. Roster Management
  app.get('/api/roster', (req, res) => {
    const today = new Date();
    const defaultMonthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthKey = (req.query.month as string) || defaultMonthKey;

    const assignments = db.assignments[monthKey] || [];
    res.json({ monthKey, assignments });
  });

  // Reset duty data to authentic official July & August state
  app.post('/api/roster/reset-official', (req, res) => {
    db.assignments['2026-07'] = generateOfficialMonthAssignments(2026, 7);
    db.assignments['2026-08'] = generateOfficialMonthAssignments(2026, 8);
    db.activityHistory = [];
    saveDatabase(db);
    res.json({ success: true, message: 'Duty database reset to official July & August 2026 Parade State.' });
  });

  // Clear all duty database data
  app.post('/api/roster/clear-all', (req, res) => {
    db.assignments = {};
    saveDatabase(db);
    res.json({ success: true, message: 'All duty database assignments erased successfully.' });
  });

  // Clear specific month duty data
  app.post('/api/roster/clear-month', (req, res) => {
    const { monthKey } = req.body;
    if (monthKey && db.assignments[monthKey]) {
      delete db.assignments[monthKey];
      saveDatabase(db);
    }
    res.json({ success: true, message: `Duty assignments for ${monthKey} erased successfully.` });
  });

// Helper function to safely generate array of date strings 'YYYY-MM-DD' without timezone shift issues
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

  // Helper to record an entry in recent activity history
  function recordActivity(action: Omit<ActivityHistoryItem, 'id' | 'timestamp'>) {
    if (!db.activityHistory) {
      db.activityHistory = [];
    }
    const air = db.airmen.find((a) => a.id === action.airmanId);
    const item: ActivityHistoryItem = {
      ...action,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      airmanRank: air?.rank,
      airmanTrade: air?.trade,
    };
    db.activityHistory.unshift(item);
    if (db.activityHistory.length > 100) {
      db.activityHistory = db.activityHistory.slice(0, 100);
    }
  }

  // 3. Duty Roster Assignment CRUD
  app.put('/api/roster/assign', (req, res) => {
    try {
      const { monthKey, assignment } = req.body as { monthKey: string; assignment: DutyAssignment };
      if (!monthKey || !assignment || !assignment.airmanId || !assignment.date || !assignment.dutyCode) {
        return res.status(400).json({ error: 'Invalid assignment parameters' });
      }

      if (!db.assignments[monthKey]) {
        db.assignments[monthKey] = [];
      }

      const list = db.assignments[monthKey];
      const index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date);
      const prevAssignment = index >= 0 ? { ...list[index] } : null;

      if (index >= 0) {
        list[index] = {
          ...list[index],
          ...assignment,
          updatedAt: new Date().toISOString(),
        };
      } else {
        list.push({
          ...assignment,
          updatedAt: new Date().toISOString(),
        });
      }

      const air = db.airmen.find((a) => a.id === assignment.airmanId);
      recordActivity({
        actionType: assignment.dutyCode === 'LEAVE' ? 'GRANT_LEAVE' : 'ASSIGN_DUTY',
        airmanId: assignment.airmanId,
        airmanName: air ? `${air.rank} ${air.name}` : assignment.airmanId,
        dutyCode: assignment.dutyCode,
        idaShift: assignment.idaShift,
        fromDate: assignment.date,
        toDate: assignment.date,
        notes: assignment.notes,
        previousAssignments: [{ airmanId: assignment.airmanId, date: assignment.date, dutyCode: prevAssignment?.dutyCode, idaShift: prevAssignment?.idaShift, notes: prevAssignment?.notes }],
      });

      saveDatabase(db);
      res.json({ success: true, assignment });
    } catch (err: any) {
      console.error('Error in /api/roster/assign:', err);
      res.status(500).json({ error: err.message || 'Failed to save duty assignment' });
    }
  });

  app.post('/api/roster/assign-range', (req, res) => {
    try {
      const { airmanId, dutyCode, idaShift, fromDate, toDate, notes, proxyForFlight, replaceAirmanId } = req.body || {};
      if (!airmanId || !dutyCode || !fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing required parameters: airmanId, dutyCode, fromDate, toDate' });
      }

      const assignedDates = getDatesInRange(fromDate, toDate);
      if (assignedDates.length === 0) {
        return res.status(400).json({ error: 'Invalid date range' });
      }

      const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

      for (const dateStr of assignedDates) {
        const monthKey = dateStr.slice(0, 7);

        if (!db.assignments[monthKey]) {
          db.assignments[monthKey] = [];
        }

        // If replaceAirmanId is provided and different from the new airmanId, unassign replaceAirmanId
        if (replaceAirmanId && replaceAirmanId !== airmanId) {
          const oldIndex = db.assignments[monthKey].findIndex(
            (a) => a.airmanId === replaceAirmanId && a.date === dateStr
          );
          if (oldIndex >= 0) {
            const oldItem = db.assignments[monthKey][oldIndex];
            prevStates.push({
              airmanId: replaceAirmanId,
              date: dateStr,
              dutyCode: oldItem.dutyCode,
              idaShift: oldItem.idaShift,
              notes: oldItem.notes,
            });
            db.assignments[monthKey].splice(oldIndex, 1);
          }
        }

        const list = db.assignments[monthKey];
        const index = list.findIndex((a) => a.airmanId === airmanId && a.date === dateStr);
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
          notes: notes || '',
          updatedAt: new Date().toISOString(),
        };

        if (index >= 0) {
          list[index] = { ...list[index], ...assignment };
        } else {
          list.push(assignment);
        }
      }

      const air = db.airmen.find((a) => a.id === airmanId);
      recordActivity({
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

      saveDatabase(db);
      res.json({ success: true, count: assignedDates.length, assignedDates });
    } catch (err: any) {
      console.error('Error in /api/roster/assign-range:', err);
      res.status(500).json({ error: err.message || 'Failed to assign duty range' });
    }
  });

  // Delete single assignment
  app.post('/api/roster/delete-assignment', (req, res) => {
    try {
      const { airmanId, date } = req.body || {};
      if (!airmanId || !date) {
        return res.status(400).json({ error: 'Missing airmanId or date' });
      }
      const monthKey = date.slice(0, 7);
      let deletedDutyCode: any = 'ON_PARADE';
      if (db.assignments[monthKey]) {
        const found = db.assignments[monthKey].find((a) => a.airmanId === airmanId && a.date === date);
        if (found) deletedDutyCode = found.dutyCode;
        db.assignments[monthKey] = db.assignments[monthKey].filter(
          (a) => !(a.airmanId === airmanId && a.date === date)
        );

        const air = db.airmen.find((a) => a.id === airmanId);
        recordActivity({
          actionType: 'DELETE_ASSIGNMENT',
          airmanId,
          airmanName: air ? `${air.rank} ${air.name}` : airmanId,
          dutyCode: deletedDutyCode,
          fromDate: date,
          toDate: date,
          notes: 'Deleted assignment',
          previousAssignments: found ? [{ airmanId, date, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes }] : [],
        });

        saveDatabase(db);
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error in /api/roster/delete-assignment:', err);
      res.status(500).json({ error: err.message || 'Failed to delete assignment' });
    }
  });

  // Delete assignment range
  app.post('/api/roster/delete-range', (req, res) => {
    try {
      const { airmanId, fromDate, toDate } = req.body || {};
      if (!airmanId || !fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing airmanId, fromDate, or toDate' });
      }
      
      const datesToDelete = getDatesInRange(fromDate, toDate);
      if (datesToDelete.length === 0) {
        return res.status(400).json({ error: 'Invalid date range' });
      }

      let deletedCount = 0;
      const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

      for (const dateStr of datesToDelete) {
        const monthKey = dateStr.slice(0, 7);
        if (db.assignments[monthKey]) {
          const found = db.assignments[monthKey].find((a) => a.airmanId === airmanId && a.date === dateStr);
          if (found) {
            prevStates.push({ airmanId, date: dateStr, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes });
          }
          const initialLen = db.assignments[monthKey].length;
          db.assignments[monthKey] = db.assignments[monthKey].filter(
            (a) => !(a.airmanId === airmanId && a.date === dateStr)
          );
          deletedCount += initialLen - db.assignments[monthKey].length;
        }
      }

      const air = db.airmen.find((a) => a.id === airmanId);
      recordActivity({
        actionType: 'CLEAR_RANGE',
        airmanId,
        airmanName: air ? `${air.rank} ${air.name}` : airmanId,
        dutyCode: 'ON_PARADE',
        fromDate,
        toDate,
        notes: `Cleared ${deletedCount} day(s)`,
        previousAssignments: prevStates,
      });

      saveDatabase(db);
      res.json({ success: true, count: deletedCount });
    } catch (err: any) {
      console.error('Error in /api/roster/delete-range:', err);
      res.status(500).json({ error: err.message || 'Failed to delete range' });
    }
  });

  // History Endpoints
  app.get('/api/roster/history', (req, res) => {
    res.json({ history: db.activityHistory || [] });
  });

  // Revert / Undo a specific history action
  app.post('/api/roster/undo-history', (req, res) => {
    try {
      const { historyId } = req.body || {};
      if (!historyId) return res.status(400).json({ error: 'Missing historyId' });

      if (!db.activityHistory) {
        return res.status(404).json({ error: 'No history found' });
      }

      const idx = db.activityHistory.findIndex((h) => h.id === historyId);
      if (idx === -1) {
        return res.status(404).json({ error: 'History item not found' });
      }

      const item = db.activityHistory[idx];

      if (item.previousAssignments && item.previousAssignments.length > 0) {
        for (const prev of item.previousAssignments) {
          const mKey = prev.date.slice(0, 7);
          if (!db.assignments[mKey]) db.assignments[mKey] = [];
          const list = db.assignments[mKey];
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
      } else if (item.fromDate && item.toDate && item.airmanId) {
        const dates = getDatesInRange(item.fromDate, item.toDate);
        for (const dStr of dates) {
          const mKey = dStr.slice(0, 7);
          if (db.assignments[mKey]) {
            db.assignments[mKey] = db.assignments[mKey].filter(
              (a) => !(a.airmanId === item.airmanId && a.date === dStr)
            );
          }
        }
      }

      db.activityHistory.splice(idx, 1);
      saveDatabase(db);
      res.json({ success: true, message: `Successfully reverted entry for ${item.airmanName}` });
    } catch (err: any) {
      console.error('Error in /api/roster/undo-history:', err);
      res.status(500).json({ error: err.message || 'Failed to undo history entry' });
    }
  });

  // Delete a history record
  app.post('/api/roster/delete-history-entry', (req, res) => {
    const { historyId } = req.body || {};
    if (db.activityHistory) {
      db.activityHistory = db.activityHistory.filter((h) => h.id !== historyId);
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // Restore/Undo previous assignments (batch)
  app.post('/api/roster/restore-assignments', (req, res) => {
    const { restoreItems } = req.body as {
      restoreItems: Array<{ airmanId: string; date: string; assignment: DutyAssignment | null }>;
    };
    if (!Array.isArray(restoreItems)) {
      return res.status(400).json({ error: 'restoreItems must be an array' });
    }

    restoreItems.forEach((item) => {
      if (!item.airmanId || !item.date) return;
      const monthKey = item.date.slice(0, 7);
      if (!db.assignments[monthKey]) {
        db.assignments[monthKey] = [];
      }
      const list = db.assignments[monthKey];
      const idx = list.findIndex((a) => a.airmanId === item.airmanId && a.date === item.date);

      if (item.assignment === null) {
        // Was previously empty -> remove
        if (idx >= 0) {
          list.splice(idx, 1);
        }
      } else {
        // Was previously an assignment -> restore it
        if (idx >= 0) {
          list[idx] = item.assignment;
        } else {
          list.push(item.assignment);
        }
      }
    });

    saveDatabase(db);
    res.json({ success: true, count: restoreItems.length });
  });

// Helper to calculate yesterday's date string YYYY-MM-DD safely without timezone shifts
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

  // 4. Daily Parade State Calculation
  app.get('/api/parade-state', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const date = (req.query.date as string) || today;
    const shift = ((req.query.shift as string) || 'Morning') as ParadeShift;
    const selectedFlight = (req.query.flight as string) || 'Overall';

    const monthKey = date.slice(0, 7);
    const monthAssignments = db.assignments[monthKey] || [];
    const dateAssignments = monthAssignments.filter((a) => a.date === date);

    const assignmentMap = new Map<string, DutyAssignment>();
    dateAssignments.forEach((a) => assignmentMap.set(a.airmanId, a));

    // Calculate yesterday's assignments for auto duty off calculation safely via UTC
    const yestStr = getYesterdayDateStr(date);
    const yestMonthKey = yestStr.slice(0, 7);
    const yestAssignments = (db.assignments[yestMonthKey] || []).filter((a) => a.date === yestStr);
    const yestMap = new Map<string, DutyAssignment>();
    yestAssignments.forEach((a) => yestMap.set(a.airmanId, a));

    // Target airmen filter
    const filteredAirmen = selectedFlight === 'Overall' 
      ? db.airmen 
      : db.airmen.filter((a) => a.flightName === selectedFlight);

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
      notes: string; 
      dutyName: string;
      previousDutyName?: string;
      statusCategory: string;
    } => {
      const ass = assignmentMap.get(airmanId);
      if (ass) {
        let dutyName: string = String(ass.dutyCode);
        let statusCategory: string = 'DUTY';

        let previousDutyName: string | undefined = undefined;

        if (ass.dutyCode === 'GD') dutyName = 'Guard Duty';
        else if (ass.dutyCode === 'BTF') dutyName = 'Base Taskforce Duty';
        else if (ass.dutyCode === 'NTF') dutyName = 'Najirpara Taskforce Duty';
        else if (ass.dutyCode === 'HALISHAHAR') dutyName = 'Halishahar Duty';
        else if (ass.dutyCode === 'AIRPORT') dutyName = 'Airport Duty';
        else if (ass.dutyCode === 'IDAC' || ass.dutyCode === 'IDA') {
          const s = ass.idaShift || 'Morning';
          dutyName = `IDAC Duty (${s})`;
          if (s === 'Night' && shift === 'Morning') {
            // Check if airman was on heavy duty yesterday
            const yestAss = yestMap.get(airmanId);
            const hadDutyYesterday = yestAss && (
              ['GD', 'BTF', 'NTF', 'AIRPORT', 'HALISHAHAR'].includes(yestAss.dutyCode) ||
              ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night')
            );
            if (hadDutyYesterday) {
              // Had duty yesterday -> Duty Off in morning -> NOT on parade
              statusCategory = 'DUTY';
              previousDutyName = (yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') ? 'IDAC Nt Off' : `${yestAss.dutyCode} Off`;
            } else {
              // No duty yesterday -> On parade in morning, night duty starts at 2100F
              statusCategory = 'PARADE';
            }
          } else {
            statusCategory = 'DUTY';
          }
        }
        else if (ass.dutyCode === 'BAKE_N_BITE') {
          dutyName = 'Bake N Bite';
          statusCategory = 'BAKE_N_BITE';
        }
        else if (ass.dutyCode === 'LEAVE') {
          dutyName = ass.notes?.includes('Annual') || ass.notes?.includes('AL') ? 'Annual Leave (AL)' : 'Casual Leave (CL)';
          statusCategory = 'LEAVE';
        }
        else if (ass.dutyCode === 'TDY') {
          dutyName = 'TDY / Attachment';
          statusCategory = 'TDY';
        }
        else if (ass.dutyCode === 'DUTY_OFF') {
          const yestAss = yestMap.get(airmanId);
          let offShort = 'Duty Off';

          if (yestAss) {
            if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
            else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
            else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
            else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
            else if (yestAss.dutyCode === 'HALISHAHAR') offShort = 'Halishahar Off';
            else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
            else if (yestAss.notes?.toLowerCase().includes('idac') || yestAss.previousDutyName?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
            else if (yestAss.dutyCode === 'DUTY_OFF') offShort = yestAss.previousDutyName || yestAss.notes || 'Duty Off';
            else offShort = `${yestAss.dutyCode} Off`;
          } else if (ass.notes) {
            if (ass.notes.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
            else if (ass.notes.toLowerCase().includes('gd')) offShort = 'GD Off';
            else if (ass.notes.toLowerCase().includes('btf')) offShort = 'BTF Off';
            else if (ass.notes.toLowerCase().includes('ntf')) offShort = 'NTF Off';
            else if (ass.notes.toLowerCase().includes('airport')) offShort = 'Airport Off';
            else if (ass.notes.toLowerCase().includes('halishahar')) offShort = 'Halishahar Off';
            else offShort = ass.notes;
          }

          // Clean duplicate "Off" words and raw codes
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
        else if (ass.dutyCode === 'ON_PARADE') {
          dutyName = 'On Parade';
          statusCategory = 'PARADE';
        }
        else if (ass.dutyCode === 'ESSN') {
          dutyName = 'Essential Task';
          statusCategory = 'ESSN';
        }
        else if (ass.dutyCode === 'CMH') {
          dutyName = 'BNS/BSH/CMH';
          statusCategory = 'CMH';
        }
        else if (ass.dutyCode === 'SICK_REPORT') {
          dutyName = 'Sick Report';
          statusCategory = 'SICK_REPORT';
        }
        else if (ass.dutyCode === 'DRILL_CAT_C') {
          dutyName = 'Drill Cat-C';
          statusCategory = 'DRILL_CAT_C';
        }
        else if (ass.dutyCode === 'ADMIN_ORDER') {
          dutyName = 'Admin Order';
          statusCategory = 'ADMIN_ORDER';
        }
        else if (ass.dutyCode === 'CLASS_TRG') {
          dutyName = 'Class / Training';
          statusCategory = 'CLASS_TRG';
        }
        else if (ass.dutyCode === 'AIRFIELD_DUTY') {
          dutyName = 'Airfield Duty';
          statusCategory = 'AIRFIELD_DUTY';
        }
        else if (ass.dutyCode === 'RECEPTION') {
          dutyName = 'K/O & Reception';
          statusCategory = 'RECEPTION';
        }
        else if (ass.dutyCode === 'GAMES') {
          dutyName = 'G/H & Games';
          statusCategory = 'GAMES';
        }
        else if (ass.dutyCode === 'ABSENT') {
          dutyName = 'Absent';
          statusCategory = 'ABSENT';
        }

        return { 
          dutyCode: ass.dutyCode, 
          idaShift: ass.idaShift, 
          proxyForFlight: ass.proxyForFlight,
          notes: ass.notes || '', 
          dutyName,
          previousDutyName,
          statusCategory,
        };
      }

      // Check yesterday's duty for auto duty-off (rest after 24hr or night guard post)
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

      return { 
        dutyCode: 'ON_PARADE', 
        dutyName: 'On Parade', 
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
      } else if (statusCategory === 'LEAVE') {
        onLeave++;
      } else if (statusCategory === 'TDY') {
        tdy++;
      } else if (statusCategory === 'OFF') {
        otherOff++;
      } else if (statusCategory === 'DUTY') {
        onDuty++;
      } else {
        onParade++;
        if ((dutyCode === 'IDAC' || dutyCode === 'IDA') && idaShift === 'Night') {
          const shiftNote = 'IDAC Night';
          if (!notes) notes = shiftNote;
          else if (!notes.includes('IDAC')) notes = `${shiftNote} - ${notes}`;
        }
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

    // Flight Breakdown
    const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
    const flightBreakdown = {} as Record<FlightName, any>;

    flights.forEach((fl) => {
      const flAirmen = db.airmen.filter((a) => a.flightName === fl);
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
        } else if (eff.statusCategory === 'LEAVE') flLeave++;
        else if (eff.statusCategory === 'TDY') flTdy++;
        else if (eff.statusCategory === 'OFF') flOff++;
        else if (eff.statusCategory === 'DUTY') flDuty++;
        else flParade++;
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

    res.json({
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
    });
  });

  // 5. Analytics & Duty Counters
  app.get('/api/analytics', (req, res) => {
    const today = new Date();
    const defaultMonthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthKey = (req.query.month as string) || defaultMonthKey;

    const monthAssignments = db.assignments[monthKey] || [];
    const airmanStats = calculateDutyStats(db.airmen, monthAssignments);
    const conflictAlerts = detectConflicts(db.airmen, monthAssignments);

    // Summary totals
    let totalGD = 0;
    let totalBTF = 0;
    let totalNTF = 0;
    let totalOtherDuties = 0;

    airmanStats.forEach((s) => {
      totalGD += s.totalGD;
      totalBTF += s.totalBTF;
      totalNTF += s.totalNTF;
      totalOtherDuties += (s.totalHalishahar + s.totalAirport + (s.totalIDAC || 0));
    });

    res.json({
      monthKey,
      airmanStats,
      conflictAlerts,
      totals: {
        totalGD,
        totalBTF,
        totalNTF,
        totalOtherDuties,
        grandTotalDuties: totalGD + totalBTF + totalNTF + totalOtherDuties,
      },
    });
  });

  // 6. Sync live Google Sheet nominal roll
  app.post('/api/sync-google-sheet', async (req, res) => {
    try {
      const defaultUrl = 'https://docs.google.com/spreadsheets/d/1tsmdZI55KL6IbPhPsRqBpGWR9uTIeDE474xF36g96nY/export?format=csv';
      const sheetUrl = req.body?.sheetUrl || defaultUrl;

      const response = await fetch(sheetUrl);
      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch sheet: ${response.statusText}` });
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');

      const newAirmen: Airman[] = [];
      let serCounter = 1;

      for (const line of lines) {
        // Look for lines containing airmen records: e.g. "1,470696,SWO,Moshiur,Cy Asst,..."
        const parts = line.split(',').map((p) => p.replace(/"/g, '').trim());
        if (parts.length >= 5) {
          const serNo = parseInt(parts[0], 10);
          const bdNoRaw = parts[1];
          const rankRaw = parts[2];
          const nameRaw = parts[3];
          const tradeRaw = parts[4];

          if (!isNaN(serNo) && bdNoRaw && rankRaw && nameRaw && tradeRaw) {
            const formattedBdNo = bdNoRaw.startsWith('BD/') ? bdNoRaw : `BD/${bdNoRaw}`;
            let flightName: FlightName;
            const nLower = nameRaw.toLowerCase();
            if (['jahid', 'mobarak', 'rubel', 'shishir', 'shihshir', 'harun', 'joy', 'zakirul', 'tusar', 'saidul', 'asad', 'shohel', 'akash', 'adnan'].some(n => nLower.includes(n))) {
              flightName = 'GCS';
            } else if (['fokrul', 'baten', 'lutfar', 'aminul', 'uzzal', 'riaz', 'mustakim', 'omar', 'rasel', 'rakib', 'nishad'].some(n => nLower.includes(n))) {
              flightName = 'Avionics';
            } else if (['ahsan', 'moshiur', 'shahin', 'ripon', 'nahid', 'ismail', 'maraz', 'shariful'].some(n => nLower.includes(n)) || ['Cy Asst', 'Sec Asst (GD)', 'Log Asst', 'Admin Clerk', 'ATCA'].includes(tradeRaw)) {
              flightName = 'Admin';
            } else {
              flightName = 'Mechanics';
            }

            newAirmen.push({
              id: `airman-gs-${serNo}`,
              serNo,
              code: `${rankRaw.toUpperCase().slice(0, 3)}-${nameRaw.toUpperCase().slice(0, 3)}`,
              bdNo: formattedBdNo,
              rank: (['SWO', 'WO', 'Sgt', 'Cpl', 'LAC'].includes(rankRaw) ? rankRaw : 'LAC') as any,
              name: nameRaw,
              trade: tradeRaw,
              addressBlock: `Barrack / Quarter ${serNo % 10 + 1}`,
              mobileNo: `01711${String(serNo).padStart(6, '0')}`,
              flightName,
              remarks: `Synced from 155 UASU BAF Google Sheet (Ser ${serNo})`,
              active: true,
            });
          }
        }
      }

      if (newAirmen.length === 0) {
        return res.status(400).json({ error: 'No valid airmen personnel rows found in Google Sheet' });
      }

      db.airmen = newAirmen;
      saveDatabase(db);

      res.json({
        success: true,
        count: db.airmen.length,
        message: `Successfully synced ${db.airmen.length} airmen from 155 UASU BAF Google Sheet`,
      });
    } catch (err: any) {
      console.error('Error syncing Google Sheet:', err);
      res.status(500).json({ error: err.message || 'Internal server error while syncing Google Sheet' });
    }
  });

  // 7. Reset Database endpoint
  app.post('/api/seed/reset', (req, res) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const currentMonthKey = `${year}-${month < 10 ? '0' + month : month}`;

    db = {
      airmen: [...INITIAL_AIRMEN],
      assignments: {
        [currentMonthKey]: generateSeedAssignments(INITIAL_AIRMEN, year, month),
      },
    };

    saveDatabase(db);
    res.json({ message: 'Database reset to default 48 BAF airmen state.' });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[155 UASU BAF] Duty Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
