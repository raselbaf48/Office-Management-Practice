import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as pdfParsePkg from 'pdf-parse';
const PDFParseClass: any = (pdfParsePkg as any).PDFParse || (pdfParsePkg as any).default?.PDFParse || (pdfParsePkg as any).default || pdfParsePkg;

import { INITIAL_AIRMEN } from './src/data/initialAirmen';
import { DUTY_TYPES } from './src/data/dutyTypes';
import { generateSeedAssignments, calculateDutyStats, detectConflicts } from './src/data/rosterGenerator';
import { generateOfficialMonthAssignments, getOfficialParadeStateDocument } from './src/data/officialJulyAugustData';
import { Airman, DutyAssignment, FlightName, ParadeShift, ActivityHistoryItem, DutyCategoryCode, IDAShift, ImportHistoryBatch } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'baf_unit_data.json');

interface LocalDB {
  airmen: Airman[];
  assignments: Record<string, DutyAssignment[]>; // monthKey YYYY-MM -> DutyAssignment[]
  activityHistory?: ActivityHistoryItem[];
  adminPasscode?: string;
  importHistory?: ImportHistoryBatch[];
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
      if (parsed && Array.isArray(parsed.airmen)) {
        // Preserve existing user modifications and custom airmen
        const existingMap = new Map<string, Airman>();
        parsed.airmen.forEach((a: Airman) => {
          if (a && a.id) existingMap.set(a.id, a);
          if (a && a.bdNo) existingMap.set(a.bdNo, a);
        });

        // Ensure baseline airmen exist while giving 100% priority to user's saved edits
        const finalAirmen: Airman[] = [];
        INITIAL_AIRMEN.forEach((initA) => {
          const existing = existingMap.get(initA.id) || existingMap.get(initA.bdNo);
          if (existing) {
            finalAirmen.push({ ...initA, ...existing });
          } else {
            finalAirmen.push(initA);
          }
        });

        // Add any newly created custom airmen that were not in INITIAL_AIRMEN
        parsed.airmen.forEach((a: Airman) => {
          if (a && !finalAirmen.some((f) => f.id === a.id || f.bdNo === a.bdNo)) {
            finalAirmen.push(a);
          }
        });

        parsed.airmen = finalAirmen.sort((a, b) => (a.serNo || 999) - (b.serNo || 999));
        if (!parsed.assignments || typeof parsed.assignments !== 'object') {
          parsed.assignments = {};
        }
        if (!parsed.activityHistory || !Array.isArray(parsed.activityHistory)) {
          parsed.activityHistory = [];
        }
        if (!parsed.adminPasscode) {
          parsed.adminPasscode = '1124';
        }
        if (!parsed.importHistory || !Array.isArray(parsed.importHistory)) {
          parsed.importHistory = [];
        }
        // Clean any placeholder notes in assignments
        Object.keys(parsed.assignments || {}).forEach((k) => {
          if (Array.isArray(parsed.assignments[k])) {
            parsed.assignments[k].forEach((a: any) => {
              if (a.notes && typeof a.notes === 'string' && a.notes.toLowerCase().includes('imported')) {
                a.notes = '';
              }
            });
          }
        });
        saveDatabase(parsed);
        return parsed as LocalDB;
      }
    } catch (err) {
      console.error('Error reading DB_FILE, re-seeding:', err);
    }
  }

  // Generate clean initial database
  const db: LocalDB = {
    airmen: [...INITIAL_AIRMEN],
    assignments: {},
    activityHistory: [],
    adminPasscode: '1124',
    importHistory: [],
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
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

  // Bulk add airmen
  app.post('/api/airmen/bulk', (req, res) => {
    const { airmen: airmenList } = req.body;
    if (!Array.isArray(airmenList) || airmenList.length === 0) {
      return res.status(400).json({ error: 'Expected array of airmen' });
    }

    let currentSerNo = db.airmen.length > 0 ? Math.max(...db.airmen.map((a) => a.serNo)) : 0;
    const createdAirmen: Airman[] = [];

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
      db.airmen.push(newAirman);
    }

    saveDatabase(db);
    res.status(201).json({ count: createdAirmen.length, airmen: createdAirmen });
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

    // Clean up any assignments for this deleted airman across all months
    if (db.assignments) {
      Object.keys(db.assignments).forEach((monthKey) => {
        if (Array.isArray(db.assignments[monthKey])) {
          db.assignments[monthKey] = db.assignments[monthKey].filter((ass) => ass.airmanId !== id);
        }
      });
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

  // Get all assignments for an entire year (Jan - Dec)
  app.get('/api/roster/year', (req, res) => {
    const targetYear = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
    const yearPrefix = `${targetYear}-`;
    const allYearAssignments: DutyAssignment[] = [];

    Object.keys(db.assignments).forEach((monthKey) => {
      if (monthKey.startsWith(yearPrefix)) {
        allYearAssignments.push(...(db.assignments[monthKey] || []));
      }
    });

    res.json({ year: targetYear, assignments: allYearAssignments });
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
      // If duty is IDAC Night, only replace an existing IDAC Night assignment.
      // If duty is IDAC Morning/Afternoon, only replace an existing IDAC Day assignment.
      // Otherwise replace any matching single assignment for this date.
      let index = -1;
      if (assignment.dutyCode === 'IDAC' || assignment.dutyCode === 'IDA') {
        if (assignment.idaShift === 'Night') {
          index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === 'Night');
        } else {
          index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift !== 'Night');
        }
      } else {
        index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date && a.dutyCode === assignment.dutyCode);
        if (index < 0) {
          // If assigning non-IDAC duty, replace non-IDAC or generic assignment
          index = list.findIndex((a) => a.airmanId === assignment.airmanId && a.date === assignment.date);
        }
      }
      const prevAssignment = index >= 0 ? { ...list[index] } : null;

      const newAssignment: DutyAssignment = {
        ...assignment,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        list[index] = newAssignment;
      } else {
        list.push(newAssignment);
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
      res.json({ success: true, assignment: newAssignment });
    } catch (err: any) {
      console.error('Error in /api/roster/assign:', err);
      res.status(500).json({ error: err.message || 'Failed to save duty assignment' });
    }
  });

  app.post('/api/roster/assign-range', (req, res) => {
    try {
      const { airmanId, dutyCode, idaShift, fromDate, toDate, notes, proxyForFlight, replaceAirmanId, disposalScope } = req.body || {};
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
        // If duty is IDAC Night, only replace an existing IDAC Night assignment.
        // If duty is IDAC Morning/Afternoon, only replace an existing IDAC Day assignment.
        // If assigning a standard daily duty (GD, Airport, Leave, etc.), replace any assignment
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

  // Batch Assign Multiple Duties All at Once
  app.post('/api/roster/batch-assign', (req, res) => {
    try {
      const { fromDate, toDate, assignments, removedAirmanIds } = req.body || {};
      if (!fromDate || !toDate || !Array.isArray(assignments)) {
        return res.status(400).json({ error: 'Missing required parameters: fromDate, toDate, assignments' });
      }

      const assignedDates = getDatesInRange(fromDate, toDate);
      if (assignedDates.length === 0) {
        return res.status(400).json({ error: 'Invalid date range' });
      }

      const prevStates: Array<{ airmanId: string; date: string; dutyCode?: any; idaShift?: any; notes?: string }> = [];

      // 1. Process removed airmen if any
      if (Array.isArray(removedAirmanIds) && removedAirmanIds.length > 0) {
        for (const dateStr of assignedDates) {
          const monthKey = dateStr.slice(0, 7);
          if (db.assignments[monthKey]) {
            for (const remId of removedAirmanIds) {
              const found = db.assignments[monthKey].find((a) => a.airmanId === remId && a.date === dateStr);
              if (found) {
                prevStates.push({ airmanId: remId, date: dateStr, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes });
              }
              db.assignments[monthKey] = db.assignments[monthKey].filter(
                (a) => !(a.airmanId === remId && a.date === dateStr)
              );
            }
          }
        }
      }

      // 2. Process all assignments (Single Disposal Rule: always replace any prior duty on that date)
      for (const item of assignments) {
        const { airmanId, dutyCode, idaShift, proxyForFlight, notes, disposalScope } = item;
        if (!airmanId || !dutyCode) continue;

        for (const dateStr of assignedDates) {
          const monthKey = dateStr.slice(0, 7);
          if (!db.assignments[monthKey]) {
            db.assignments[monthKey] = [];
          }

          const list = db.assignments[monthKey];
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

      const dutySummaryNames = assignments
        .map((a) => {
          const air = db.airmen.find((airm) => airm.id === a.airmanId);
          return `${air ? air.name : a.airmanId} (${a.dutyCode})`;
        })
        .slice(0, 5)
        .join(', ');

      recordActivity({
        actionType: 'ASSIGN_DUTY',
        airmanId: 'BATCH_ASSIGN',
        airmanName: `${assignments.length} Duties Assigned`,
        dutyCode: 'GD',
        fromDate,
        toDate,
        notes: `Batch assigned ${assignments.length} duties [${dutySummaryNames}${assignments.length > 5 ? '...' : ''}] across ${assignedDates.length} date(s)`,
        previousAssignments: prevStates,
      });

      saveDatabase(db, 'ROSTER_UPDATED');
      res.json({
        success: true,
        count: assignments.length,
        assignedDates,
        message: `Successfully assigned ${assignments.length} duties across ${assignedDates.length} date(s)!`,
      });
    } catch (err: any) {
      console.error('Error in /api/roster/batch-assign:', err);
      res.status(500).json({ error: err.message || 'Failed to batch assign duties' });
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
      const { airmanId, fromDate, toDate, dutyCode, idaShift } = req.body || {};
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
          const matchFn = (a: DutyAssignment) => {
            if (a.airmanId !== airmanId || a.date !== dateStr) return false;
            if (dutyCode) {
              if (dutyCode === 'ATT' || dutyCode === 'AIRPORT') {
                if (a.dutyCode !== 'ATT' && a.dutyCode !== 'AIRPORT') return false;
              } else if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
                if (a.dutyCode !== 'IDAC' && a.dutyCode !== 'IDA') return false;
                if (idaShift && a.idaShift !== idaShift) return false;
              } else if (a.dutyCode !== dutyCode) {
                return false;
              }
            }
            return true;
          };

          const found = db.assignments[monthKey].find(matchFn);
          if (found) {
            prevStates.push({ airmanId, date: dateStr, dutyCode: found.dutyCode, idaShift: found.idaShift, notes: found.notes });
          }
          const initialLen = db.assignments[monthKey].length;
          db.assignments[monthKey] = db.assignments[monthKey].filter((a) => !matchFn(a));
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

  // Edit a history record and its live duty assignment
  app.post('/api/roster/edit-history-entry', (req, res) => {
    try {
      const { historyId, airmanId, dutyCode, idaShift, fromDate, toDate, notes } = req.body || {};
      if (!historyId || !airmanId || !dutyCode || !fromDate || !toDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      if (!db.activityHistory) db.activityHistory = [];
      const hIdx = db.activityHistory.findIndex((h) => h.id === historyId);
      const oldItem = hIdx >= 0 ? db.activityHistory[hIdx] : null;

      // 1. Remove old assignment dates if oldItem existed
      if (oldItem && oldItem.fromDate && oldItem.toDate && oldItem.airmanId) {
        const oldDates = getDatesInRange(oldItem.fromDate, oldItem.toDate);
        for (const dStr of oldDates) {
          const mKey = dStr.slice(0, 7);
          if (db.assignments[mKey]) {
            db.assignments[mKey] = db.assignments[mKey].filter(
              (a) => !(a.airmanId === oldItem.airmanId && a.date === dStr && (oldItem.dutyCode !== 'IDAC' || a.idaShift === oldItem.idaShift))
            );
          }
        }
      }

      // 2. Add updated assignment dates
      const newDates = getDatesInRange(fromDate, toDate);
      for (const dStr of newDates) {
        const mKey = dStr.slice(0, 7);
        if (!db.assignments[mKey]) db.assignments[mKey] = [];
        db.assignments[mKey].push({
          airmanId,
          date: dStr,
          dutyCode,
          idaShift,
          notes: notes || '',
          updatedAt: new Date().toISOString(),
        });
      }

      // 3. Update history item
      const air = db.airmen.find((a) => a.id === airmanId);
      if (hIdx >= 0) {
        db.activityHistory[hIdx] = {
          ...db.activityHistory[hIdx],
          airmanId,
          airmanName: air ? `${air.rank} ${air.name}` : airmanId,
          dutyCode,
          idaShift,
          fromDate,
          toDate,
          notes: notes || '',
          timestamp: new Date().toISOString(),
        };
      }

      saveDatabase(db);
      res.json({ success: true, message: 'History entry updated successfully' });
    } catch (err: any) {
      console.error('Error in /api/roster/edit-history-entry:', err);
      res.status(500).json({ error: err.message || 'Failed to edit history entry' });
    }
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

  // --- AUTH & PASSCODE MANAGEMENT ---
  app.post('/api/auth/verify', (req, res) => {
    const { passcode } = req.body || {};
    const current = db.adminPasscode || '1124';
    if (passcode === current) {
      return res.json({ success: true, role: 'ADMIN' });
    }
    return res.status(401).json({ success: false, error: 'Incorrect passcode. Please enter the valid 4-digit master passcode.' });
  });

  app.post('/api/auth/change-passcode', (req, res) => {
    const { currentPasscode, newPasscode } = req.body || {};
    const current = db.adminPasscode || '1124';
    if (currentPasscode !== current) {
      return res.status(401).json({ error: 'Current passcode is incorrect.' });
    }
    if (!newPasscode || String(newPasscode).length !== 4 || !/^\d{4}$/.test(String(newPasscode))) {
      return res.status(400).json({ error: 'New passcode must be exactly 4 numeric digits.' });
    }
    db.adminPasscode = String(newPasscode);
    saveDatabase(db);
    res.json({ success: true, message: 'Admin master passcode updated successfully.' });
  });

  // --- IMPORT HISTORY & REVERT ENDPOINTS ---
  app.get('/api/import/history', (req, res) => {
    res.json({ history: db.importHistory || [] });
  });

  app.delete('/api/import/history/:batchId', (req, res) => {
    try {
      const { batchId } = req.params;
      if (!db.importHistory || db.importHistory.length === 0) {
        return res.status(404).json({ error: 'No import history records found' });
      }

      const batchIdx = db.importHistory.findIndex((b) => b.id === batchId);
      if (batchIdx === -1) {
        return res.status(404).json({ error: 'Import history batch not found' });
      }

      const batch = db.importHistory[batchIdx];

      // Restore previous states or delete imported assignments
      const prevMap = new Map<string, any>();
      (batch.previousAssignments || []).forEach((p) => {
        prevMap.set(`${p.airmanId}_${p.date}`, p);
      });

      for (const item of batch.importedAssignments) {
        const monthKey = item.date.slice(0, 7);
        if (!db.assignments[monthKey]) continue;

        const list = db.assignments[monthKey];
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
          if (existingIdx >= 0) {
            list[existingIdx] = restored;
          } else {
            list.push(restored);
          }
        } else {
          // It had no prior duty recorded -> remove the imported assignment
          if (existingIdx >= 0) {
            list.splice(existingIdx, 1);
          }
        }
      }

      // Remove batch from history
      db.importHistory.splice(batchIdx, 1);

      recordActivity({
        actionType: 'DELETE_ASSIGNMENT',
        airmanId: 'BULK_IMPORT_REVERT',
        airmanName: `Reverted ${batch.dutyCount} Duties`,
        dutyCode: 'GD',
        fromDate: batch.dates[0] || '',
        toDate: batch.dates[batch.dates.length - 1] || '',
        notes: `Deleted & reverted imported batch "${batch.sourceDoc}" (${batch.dutyCount} duties across ${batch.datesCount} dates)`,
      });

      saveDatabase(db, 'ROSTER_UPDATED');

      res.json({
        success: true,
        message: `Import batch (${batch.sourceDoc}) has been completely deleted and reverted successfully!`,
      });
    } catch (err: any) {
      console.error('Error deleting import batch:', err);
      res.status(500).json({ error: err.message || 'Failed to delete import batch' });
    }
  });

  // --- DATABASE EXPORT & RESTORE ---
  const handleExportDB = (req: any, res: any) => {
    res.setHeader('Content-Disposition', 'attachment; filename="155_uasu_duty_database.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json({
      exportedAt: new Date().toISOString(),
      unit: '155 UASU, BAF BASE ZHR',
      version: '2.0',
      airmen: db.airmen || [],
      assignments: db.assignments || {},
      activityHistory: db.activityHistory || [],
      adminPasscode: db.adminPasscode || '1124',
      importHistory: db.importHistory || [],
    });
  };

  app.get('/api/database/export', handleExportDB);
  app.get('/api/database/backup', handleExportDB);

  app.post('/api/database/restore', (req, res) => {
    try {
      const uploadedData = req.body;
      if (!uploadedData) {
        return res.status(400).json({ error: 'No backup data provided' });
      }

      // Handle raw DB or wrapped payload
      const airmen = uploadedData.airmen || uploadedData.database?.airmen;
      const assignments = uploadedData.assignments || uploadedData.database?.assignments || uploadedData.database?.roster;

      if (airmen && Array.isArray(airmen)) {
        db.airmen = airmen;
        if (assignments && typeof assignments === 'object' && !Array.isArray(assignments)) {
          db.assignments = assignments;
        } else if (Array.isArray(assignments)) {
          // If array of assignments, group by monthKey
          db.assignments = {};
          for (const a of assignments) {
            if (a && a.date) {
              const mKey = a.date.slice(0, 7);
              if (!db.assignments[mKey]) db.assignments[mKey] = [];
              db.assignments[mKey].push(a);
            }
          }
        }
        if (Array.isArray(uploadedData.activityHistory)) {
          db.activityHistory = uploadedData.activityHistory;
        }
        if (Array.isArray(uploadedData.importHistory)) {
          db.importHistory = uploadedData.importHistory;
        }
        if (uploadedData.adminPasscode) {
          db.adminPasscode = uploadedData.adminPasscode;
        }

        saveDatabase(db, 'DATA_RESTORED');
        return res.json({ success: true, message: `Database restored successfully with ${db.airmen.length} airmen!` });
      }
      return res.status(400).json({ error: 'Invalid database backup JSON structure. Missing airmen list.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to restore database' });
    }
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
    const stateType = ((req.query.stateType as string) || (req.query.documentType as string) || 'PARADE').toUpperCase();
    const isPT = stateType === 'PT';

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
      disposalScope?: 'ALL' | 'PARADE' | 'PT';
      notes: string; 
      dutyName: string;
      previousDutyName?: string;
      statusCategory: string;
    } => {
      const ass = assignmentMap.get(airmanId);
      
      // If assignment has a scope filter that does NOT match current state, ignore it
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
        else if (codeStr === 'AIRPORT' || codeStr === 'AIRFIELD' || codeStr === 'ATT') dutyName = 'Airfield Duty';
        else if (codeStr === 'IDAC' || codeStr === 'IDA') {
          const s = ass.idaShift || 'Morning';
          dutyName = `IDAC Duty (${s})`;
          
          if (isPT) {
            // In PT State: "IDAC Nt jar se Duty On Jbe"
            statusCategory = 'DUTY';
          } else {
            // In Parade State: "Parade State a IDAC Nt Duty On jbe na, On parade jbe, mane jar IDAC Nt duty se normal office kore Nt korbe"
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
            // In PT State: "PT State e Duty Off PT te join korbe" -> They join PT!
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
            else if (yestCodeStr === 'AIRPORT' || yestCodeStr === 'AIRFIELD' || yestCodeStr === 'ATT') offShort = 'Airport Off';
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
        else if (codeStr === 'ATT') {
          dutyName = 'Airfield Duty';
          statusCategory = 'ATT';
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
        else if (codeStr === 'OTHERS') {
          dutyName = ass.notes || 'Other Disposal';
          statusCategory = 'OTHERS';
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

      // Check yesterday's duty for auto duty-off (rest after 24hr or night guard post)
      // In PT State: Duty Off joins PT!
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
        // Disposals (ESSN, CMH, SICK_REPORT, DRILL_CAT_C, ADMIN_ORDER, CLASS_TRG, AIRFIELD_DUTY, RECEPTION, GAMES, ABSENT, OTHERS)
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
    db = {
      airmen: [...INITIAL_AIRMEN],
      assignments: {},
      activityHistory: [],
      adminPasscode: db.adminPasscode || '1124',
      importHistory: [],
    };

    saveDatabase(db);
    res.json({ message: 'Database reset to clean format with default 48 BAF airmen and empty duty register.' });
  });

  // 8. AI PDF / Image / Document Duty Data Import Analyzer (Gemini Powered)
  let aiClient: GoogleGenAI | null = null;
  function getGeminiAI(): GoogleGenAI {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Detect rank from text helper
  function detectRankFromText(rawText: string): string | null {
    if (!rawText || typeof rawText !== 'string') return null;
    const lower = rawText.toLowerCase().replace(/[\.]/g, '');
    if (/\b(?:mwo|master\s*warrant\s*officer|m\s*w\s*o)\b/i.test(lower)) return 'MWO';
    if (/\b(?:swo|senior\s*warrant\s*officer|s\s*w\s*o)\b/i.test(lower)) return 'SWO';
    if (/\b(?:flt\s*sgt|f\/sgt|flight\s*sergeant|fs)\b/i.test(lower)) return 'Flt Sgt';
    if (/\b(?:wo|warrant\s*officer|w\s*o)\b/i.test(lower)) return 'WO';
    if (/\b(?:sgt|sergeant)\b/i.test(lower)) return 'Sgt';
    if (/\b(?:cpl|corporal)\b/i.test(lower)) return 'Cpl';
    if (/\b(?:lac|leading\s*aircraftman|l\s*a\s*c)\b/i.test(lower)) return 'LAC';
    if (/\b(?:ac|aircraftman|a\s*c)\b/i.test(lower)) return 'AC';
    return null;
  }

  function cleanAirmanNameFromText(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText
      .replace(/^[0-9]+[.\-)]\s*/, '')
      .replace(/\b(?:bd\/?|)(\d{5,7})\b/gi, '')
      .replace(/\b(?:mwo|swo|flt\s*sgt|f\/sgt|wo|sgt|cpl|lac|ac)\b/gi, '')
      .replace(/\b(?:master\s*warrant\s*officer|senior\s*warrant\s*officer|flight\s*sergeant|warrant\s*officer|sergeant|corporal|leading\s*aircraftman|aircraftman)\b/gi, '')
      .replace(/\b(?:avi|mech|gcs|admin)\s*(?:flt|flight)?\b/gi, '')
      .replace(/\((?:Morning|Afternoon|Night|CL|AL|Leave|Off|GD|BTF|NTF|IDAC|TDY|Bakery|CMH|Airport)\)/gi, '')
      .replace(/^(?:Sy Duty|TF Duty|BTF|NTF|GD|IDAC|Leave|TDY)\s*[-:]\s*/gi, '')
      .replace(/[^a-zA-Z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeRank(rank: string): string {
    const r = rank.toUpperCase().replace(/[\.\s]/g, '');
    if (r === 'MWO' || r === 'MASTERWARRA') return 'MWO';
    if (r === 'SWO' || r === 'SENIORWARRA') return 'SWO';
    if (r === 'FLTSGT' || r === 'FS' || r === 'FLIGHTSERG') return 'FLT SGT';
    if (r === 'WO' || r === 'WARRANTOFF') return 'WO';
    if (r === 'SGT' || r === 'SERGEANT') return 'SGT';
    if (r === 'CPL' || r === 'CORPORAL') return 'CPL';
    if (r === 'LAC' || r === 'LEADINGAIR') return 'LAC';
    if (r === 'AC' || r === 'AIRCRAFTMA') return 'AC';
    return r;
  }

  // Fuzzy matcher to find the best matching airman for a given extracted text snippet (RANK FIRST)
  function findBestAirmanMatch(rawText: string, flightHint?: FlightName | 'Overall'): { airman: Airman | null; confidence: number } {
    if (!rawText || !rawText.trim() || !Array.isArray(db.airmen) || db.airmen.length === 0) {
      return { airman: null, confidence: 0 };
    }
    const rawTrimmed = rawText.trim();
    const cleaned = rawTrimmed.replace(/^[0-9]+[.\-)]\s*/, '').trim().toLowerCase();

    // 1. Direct BD No check
    const bdMatch = cleaned.match(/\b(?:bd\/?|)(\d{5,7})\b/i);
    if (bdMatch) {
      const found = db.airmen.find((a) => a.bdNo.includes(bdMatch[1]));
      if (found) return { airman: found, confidence: 0.99 };
    }

    // 2. Exact match on code (e.g. WO-BTN, SGT-UZL, LAC-RSB, etc.)
    const codeFound = db.airmen.find((a) => cleaned.includes(a.code.toLowerCase()));
    if (codeFound) return { airman: codeFound, confidence: 0.95 };

    // 3. Match by rank FIRST, then name
    const detectedRank = detectRankFromText(rawTrimmed);
    const cleanName = cleanAirmanNameFromText(rawTrimmed).toLowerCase();

    if (detectedRank) {
      const normDetectedRank = normalizeRank(detectedRank);
      const rankCandidates = db.airmen.filter((a) => normalizeRank(a.rank) === normDetectedRank);

      if (rankCandidates.length > 0) {
        let searchPool = rankCandidates;
        if (flightHint && flightHint !== 'Overall') {
          const flightRank = rankCandidates.filter((a) => a.flightName === flightHint);
          if (flightRank.length > 0) {
            searchPool = [...flightRank, ...rankCandidates.filter((a) => a.flightName !== flightHint)];
          }
        }

        // Exact name match in rank
        for (const a of searchPool) {
          const aName = a.name.toLowerCase();
          if (cleanName && cleanName === aName) {
            return { airman: a, confidence: 0.96 };
          }
        }

        // Substring match in rank
        for (const a of searchPool) {
          const aName = a.name.toLowerCase();
          if (cleanName.length >= 3 && (aName.includes(cleanName) || cleanName.includes(aName))) {
            return { airman: a, confidence: 0.94 };
          }
        }

        // Token match in rank
        const queryWords = cleanName.split(/\s+/).filter((w) => w.length >= 3);
        let bestRankMatch: Airman | null = null;
        let highestScore = 0;

        for (const a of searchPool) {
          const aWords = a.name.toLowerCase().split(/[\s,./-]+/).filter((w) => w.length >= 3);
          let score = 0;
          for (const qw of queryWords) {
            for (const aw of aWords) {
              if (qw === aw) score += 2;
              else if (aw.includes(qw) || qw.includes(aw)) score += 1;
            }
          }
          if (score > highestScore) {
            highestScore = score;
            bestRankMatch = a;
          }
        }

        if (bestRankMatch && highestScore > 0) {
          return { airman: bestRankMatch, confidence: 0.90 };
        }
      }
    }

    // 4. Fallback: match without rank constraint
    let candidatePool = db.airmen;
    if (flightHint && flightHint !== 'Overall') {
      const flightList = db.airmen.filter((a) => a.flightName === flightHint);
      if (flightList.length > 0) {
        candidatePool = [...flightList, ...db.airmen.filter((a) => a.flightName !== flightHint)];
      }
    }

    const searchName = (cleanName || cleaned).toLowerCase();
    for (const a of candidatePool) {
      const nameLower = a.name.toLowerCase();
      if (searchName.length >= 3 && (nameLower.includes(searchName) || searchName.includes(nameLower))) {
        return { airman: a, confidence: 0.88 };
      }
    }

    const words = searchName.split(/[\s,./-]+/).filter((w) => w.length >= 3);
    for (const a of candidatePool) {
      const aWords = a.name.toLowerCase().split(/[\s,./-]+/).filter((w) => w.length >= 3);
      for (const w of words) {
        if (aWords.some((aw) => aw.includes(w) || w.includes(aw))) {
          return { airman: a, confidence: 0.82 };
        }
      }
    }

    return { airman: null, confidence: 0 };
  }

  // Extract all text and pages from a PDF buffer using PDFParseClass
  async function extractAllPagesFromPdf(buffer: Buffer): Promise<{ totalPages: number; pages: Array<{ pageNumber: number; text: string }>; fullText: string }> {
    try {
      const parser = new PDFParseClass({ data: buffer });
      const parsed = await parser.getText({ cellSeparator: ' | ', lineEnforce: true });
      const totalPages = parsed.total || parsed.pages?.length || 1;
      const pages: Array<{ pageNumber: number; text: string }> = [];

      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        for (const p of parsed.pages) {
          const pageNum = p.num || pages.length + 1;
          const pageText = (p.text || '').trim();
          pages.push({
            pageNumber: pageNum,
            text: pageText,
          });
        }
      } else if (parsed.text && parsed.text.trim()) {
        pages.push({
          pageNumber: 1,
          text: parsed.text.trim(),
        });
      }

      const fullText = pages.map((p) => `--- [PAGE ${p.pageNumber} OF ${totalPages}] ---\n${p.text}`).join('\n\n');
      return { totalPages, pages, fullText };
    } catch (err: any) {
      console.warn('PDFParse extraction note:', err?.message || err);
      // Fallback: extract binary text stream if available
      const rawStr = buffer.toString('binary');
      const textMatches = rawStr.match(/\(([^()]{2,100})\)\s*(?:Tj|TJ|'|")/g);
      let fallbackText = '';
      if (textMatches && textMatches.length > 5) {
        fallbackText = textMatches
          .map((m) => m.replace(/^\(|\)\s*(?:Tj|TJ|'|")$/g, '').trim())
          .filter((t) => t.length > 1)
          .join(' ');
      }
      return {
        totalPages: 1,
        pages: fallbackText ? [{ pageNumber: 1, text: fallbackText }] : [],
        fullText: fallbackText,
      };
    }
  }

  // Advanced Heuristic BAF Duty Table Parser (Supports table grids, section headers, multi-flight pages, and 20+ unlimited pages)
  function parseRosterTextHeuristically(
    rawInputText: string,
    targetYear: number,
    targetFlight: FlightName | 'Overall'
  ): any {
    const lines = rawInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let defaultFlight: FlightName = targetFlight === 'Overall' ? 'Avionics' : targetFlight;
    let currentFlight: FlightName = defaultFlight;

    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      january: '01', february: '02', march: '03', april: '04', may_: '05', june: '06',
      july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
    };

    const dateMap = new Map<string, { date: string; day: string; assignments: any[] }>();
    const dateRegex = /(?:^|\b)(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+([A-Za-z]+))?/i;
    const numericDateRegex = /(?:^|\b)(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})|(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/;

    let activeSectionDuty: DutyCategoryCode | null = null;
    let activeSectionDutyName = '';
    let activeSectionIdaShift: IDAShift | null = null;

    // Detect section headers (e.g. "Sy Duty", "TF Duty", "IDAC Duty", "Leave")
    const detectSectionDuty = (line: string): { code: DutyCategoryCode; name: string; shift: IDAShift | null } | null => {
      const upper = line.toUpperCase().trim();
      if (upper === 'SY DUTY' || upper === 'SECURITY DUTY' || upper.startsWith('SY DUTY') || upper.startsWith('BASE SECURITY') || upper === 'GD') {
        return { code: 'GD', name: 'Base Security Duty', shift: null };
      }
      if (upper === 'TF DUTY' || upper === 'TASK FORCE DUTY' || upper.startsWith('TF DUTY') || upper.startsWith('TASK FORCE')) {
        return { code: 'BTF', name: 'Base Taskforce Duty', shift: null };
      }
      if (upper === 'NTF' || upper.includes('NAJIRPARA')) {
        return { code: 'NTF', name: 'Najirpara Taskforce Duty', shift: null };
      }
      if (upper.includes('HALISHAHAR') || upper === 'HALI DUTY') {
        return { code: 'HALISHAHAR', name: 'Halishahar Taskforce Duty', shift: null };
      }
      if (upper.includes('AIRFIELD') || upper.includes('AIRPORT')) {
        return { code: 'ATT', name: 'Airfield Duty', shift: null };
      }
      if (upper.includes('IDAC') || upper.includes('IDA CENTER')) {
        let shift: IDAShift = 'Morning';
        if (upper.includes('NIGHT')) shift = 'Night';
        else if (upper.includes('AFTERNOON') || upper.includes('AFT')) shift = 'Afternoon';
        return { code: 'IDAC', name: 'IDA Center Duty', shift };
      }
      if (upper === 'LEAVE' || upper.startsWith('LEAVE') || upper === 'CL' || upper === 'AL') {
        return { code: 'LEAVE', name: 'Leave (CL/AL)', shift: null };
      }
      if (upper.includes('BAKE N BITE') || upper.includes('BAKE & BITE')) {
        return { code: 'BAKE_N_BITE', name: 'Bake N Bite', shift: null };
      }
      if (upper === 'TDY' || upper.startsWith('TDY')) {
        return { code: 'TDY', name: 'TDY', shift: null };
      }
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upperLine = line.toUpperCase();

      // Check for page markers and flight headers
      if (upperLine.includes('AVI FLT') || upperLine.includes('AVIONIC')) {
        currentFlight = 'Avionics';
      } else if (upperLine.includes('MECH FLT') || upperLine.includes('MECHANIC')) {
        currentFlight = 'Mechanics';
      } else if (upperLine.includes('GCS FLT') || upperLine.includes('GCS')) {
        currentFlight = 'GCS';
      } else if (upperLine.includes('ADMIN FLT') || upperLine.includes('ADMIN')) {
        currentFlight = 'Admin';
      }

      // Check if line is a section header (e.g. "Sy Duty", "TF Duty")
      const sectionMatch = detectSectionDuty(line);
      if (sectionMatch && !line.match(dateRegex)) {
        activeSectionDuty = sectionMatch.code;
        activeSectionDutyName = sectionMatch.name;
        activeSectionIdaShift = sectionMatch.shift;
        continue;
      }

      let dateStr = '';
      let dayName = '';
      let lineContent = '';

      const match = line.match(dateRegex);
      if (match) {
        const dayNum = match[1].padStart(2, '0');
        const monthStr = match[2].toLowerCase().slice(0, 3);
        const monthNum = monthMap[monthStr] || '08';
        dayName = match[3] || '';
        dateStr = `${targetYear}-${monthNum}-${dayNum}`;
        lineContent = line.slice(match.index! + match[0].length).replace(/^[\s:—|]+/, '').trim();
      } else {
        const numMatch = line.match(numericDateRegex);
        if (numMatch) {
          if (numMatch[1]) {
            dateStr = `${numMatch[1]}-${numMatch[2].padStart(2, '0')}-${numMatch[3].padStart(2, '0')}`;
          } else {
            const yr = numMatch[6].length === 2 ? `20${numMatch[6]}` : numMatch[6];
            dateStr = `${yr}-${numMatch[5].padStart(2, '0')}-${numMatch[4].padStart(2, '0')}`;
          }
          lineContent = line.slice(numMatch.index! + numMatch[0].length).replace(/^[\s:—|]+/, '').trim();
        }
      }

      if (dateStr) {
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { date: dateStr, day: dayName, assignments: [] });
        }
        const entry = dateMap.get(dateStr)!;

        // Process tokens in lineContent
        const tokens = lineContent.split(/(?:[-—|•\t;]+|\s{2,})/);

        for (const token of tokens) {
          const cleanToken = token.trim();
          if (!cleanToken || cleanToken === '-' || cleanToken === '--' || cleanToken.length < 2) continue;

          // Split numbered items e.g., "1. WO Aminul 2. Sgt Uzzal" or comma-separated
          const subNames = cleanToken
            .split(/(?=\d+[.\-)])|,/)
            .map((s) => s.replace(/^\d+[.\-)]\s*/, '').trim())
            .filter((s) => s.length > 2);
          const namesToProcess = subNames.length > 0 ? subNames : [cleanToken];

          for (const item of namesToProcess) {
            let dutyCode: DutyCategoryCode = activeSectionDuty || 'ON_PARADE';
            let dutyName = activeSectionDutyName || 'On Parade';
            let idaShift: IDAShift | null = activeSectionIdaShift || null;

            const itemUpper = item.toUpperCase();
            const fullLineUpper = lineContent.toUpperCase();

            // Override with inline duty indicators if present
            if (itemUpper.includes('NTF') || itemUpper.includes('NAJIRPARA') || fullLineUpper.includes('NAJIRPARA')) {
              dutyCode = 'NTF';
              dutyName = 'Najirpara Taskforce Duty';
            } else if (itemUpper.includes('BTF') || fullLineUpper.includes('BASE TASKFORCE')) {
              dutyCode = 'BTF';
              dutyName = 'Base Taskforce Duty';
            } else if (itemUpper.includes('TF DUTY') || itemUpper.startsWith('TF -')) {
              dutyCode = 'BTF';
              dutyName = 'Base Taskforce Duty';
            } else if (itemUpper.includes('GD') || itemUpper.includes('SY DUTY') || fullLineUpper.includes('BASE SECURITY')) {
              dutyCode = 'GD';
              dutyName = 'Base Security Duty';
            } else if (itemUpper.includes('HALISHAHAR') || itemUpper.includes('HALI')) {
              dutyCode = 'HALISHAHAR';
              dutyName = 'Halishahar Taskforce Duty';
            } else if (itemUpper.includes('AIRFIELD') || itemUpper.includes('AIRPORT')) {
              dutyCode = 'ATT';
              dutyName = 'Airfield Duty';
            } else if (itemUpper.includes('LEAVE') || itemUpper.includes(' C/L') || itemUpper.includes(' A/L')) {
              dutyCode = 'LEAVE';
              dutyName = 'Leave (CL/AL)';
            } else if (itemUpper.includes('NIGHT') || itemUpper.includes('IDA NIGHT')) {
              dutyCode = 'IDAC';
              dutyName = 'IDA Center Duty';
              idaShift = 'Night';
            } else if (itemUpper.includes('AFTERNOON') || itemUpper.includes('IDA AFT')) {
              dutyCode = 'IDAC';
              dutyName = 'IDA Center Duty';
              idaShift = 'Afternoon';
            } else if (itemUpper.includes('MORNING') || itemUpper.includes('IDA MORN')) {
              dutyCode = 'IDAC';
              dutyName = 'IDA Center Duty';
              idaShift = 'Morning';
            } else if (itemUpper.includes('OFF') || itemUpper.includes('DUTY OFF')) {
              dutyCode = 'DUTY_OFF';
              dutyName = 'Duty Off';
            }

            // Clean duty prefix from name string (e.g., "LAC Rakib (Night)" -> "LAC Rakib")
            const cleanName = item
              .replace(/\((?:Morning|Afternoon|Night|CL|AL|Leave|Off)\)/gi, '')
              .replace(/^(?:Sy Duty|TF Duty|BTF|NTF|GD|IDAC|Leave|TDY)\s*[-:]\s*/gi, '')
              .trim();

            if (dutyCode === 'DUTY_OFF' || dutyCode === 'ON_PARADE') {
              continue;
            }

            const matched = findBestAirmanMatch(cleanName || item, currentFlight);
            if (matched.airman) {
              const alreadyExists = entry.assignments.some(
                (a) => a.matchedAirmanId === matched.airman!.id && a.dutyCode === dutyCode && (dutyCode !== 'IDAC' || a.idaShift === idaShift)
              );
              if (!alreadyExists) {
                entry.assignments.push({
                  rawText: cleanName || item,
                  dutyCode,
                  dutyName,
                  idaShift,
                  matchedAirmanId: matched.airman.id,
                  matchedAirmanName: matched.airman.name,
                  matchedAirmanRank: matched.airman.rank,
                  matchedAirmanFlight: matched.airman.flightName,
                  matchedAirmanBdNo: matched.airman.bdNo,
                  confidence: matched.confidence,
                });
              }
            } else if (cleanName.length > 2 && !['DUTY', 'PARADE', 'STATE', 'FLIGHT', 'TOTAL', 'OFF', 'PRESENT', 'LEAVE'].some((k) => itemUpper === k)) {
              const alreadyExists = entry.assignments.some((a) => a.rawText === (cleanName || item) && a.dutyCode === dutyCode);
              if (!alreadyExists) {
                entry.assignments.push({
                  rawText: cleanName || item,
                  dutyCode,
                  dutyName,
                  idaShift,
                  matchedAirmanId: null,
                  matchedAirmanName: cleanName || item,
                  confidence: 0,
                });
              }
            }
          }
        }
      }
    }

    const dates = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      documentTitle: `PARADE STATE / DUTY ROSTER : ${currentFlight.toUpperCase()} FLT`,
      detectedFlight: currentFlight,
      year: targetYear,
      month: 8,
      totalDates: dates.length,
      dateRange: {
        start: dates[0]?.date || `${targetYear}-08-01`,
        end: dates[dates.length - 1]?.date || `${targetYear}-08-31`,
      },
      dates,
    };
  }

  // --- MULTI-PAGE AI DUTY IMPORT ENDPOINT (Supports 20+ Unlimited Pages) ---
  app.post('/api/import/analyze-duty-doc', async (req, res) => {
    try {
      const { fileBase64, files, mimeType, textSnippet, targetYear = 2026, targetFlight = 'Overall' } = req.body || {};

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
          mime: mimeType || 'application/pdf',
          name: 'Document',
        });
      }

      if (fileList.length === 0 && !textSnippet) {
        return res.status(400).json({ error: 'No file data or text provided for analysis' });
      }

      // Airmen reference roster
      const airmenRoster = db.airmen.map((a) => ({
        id: a.id,
        serNo: a.serNo,
        code: a.code,
        bdNo: a.bdNo,
        rank: a.rank,
        name: a.name,
        trade: a.trade,
        flight: a.flightName,
      }));

      const airmenContext = airmenRoster
        .map((a) => `- ID: "${a.id}" | ${a.rank} ${a.name} | BD/${a.bdNo} | ${a.flight} Flight | Trade: ${a.trade}`)
        .join('\n');

      const systemPrompt = `You are an expert military duty roster and parade state parser for Bangladesh Air Force (BAF) 155 UASU.
Your task is to accurately analyze the provided document (multi-page PDF / image tables / text) containing a daily duty roster or parade state matrix and extract ALL assigned duties for EVERY SINGLE DATE and airman across ALL pages without skipping or stopping early.

DATABASE PERSONNEL ROSTER (Reference for matching names/ranks):
${airmenContext}

STANDARD DUTY CODES:
- GD: Base Security Duty / Guard Duty
- BTF: Base Taskforce Duty
- NTF: Najirpara Taskforce Duty
- HALISHAHAR: Halishahar Taskforce Duty
- AIRFIELD_DUTY: Airfield Duty
- LEAVE: Leave / Casual Leave / Privilege Leave
- IDAC: IDA CENTER Duty (specify idaShift as 'Morning', 'Afternoon', or 'Night')
- DUTY_OFF: Duty Off / Rest Day (Skip from output)
- ON_PARADE: Available On Parade / Routine Duty (Skip from output)
- BAKE_N_BITE: Bake & Bite
- ESSN: Essential Task / ESSN
- CMH: Hospital / CMH / Medical Admission
- SICK_REPORT: Sick Report / S/Q / ED
- DRILL_CAT_C: Drill Cat C
- RECEPTION: Reception / KO
- TDY: Temporary Duty / Attachment / Detachment
- ADMIN_ORDER: Admin Order
- CLASS_TRG: Class / Training
- GAMES: Games / GH
- ABSENT: Absent / AWOL

CRITICAL MANDATORY MULTI-PAGE INSTRUCTIONS:
1. FULL DOCUMENT ITERATION ACROSS ALL PAGES:
   - The document may contain multiple pages (Page 1 to Page 20+). You MUST extract duties from EVERY SINGLE PAGE.
   - Iterate through EVERY SINGLE ROW in every table from the first date to the very last date.
   - DO NOT STOP AFTER THE FIRST PAGE OR FIRST ROW.
   - DO NOT SKIP ANY DATES OR PERSONNEL.
   - Output every valid date into the "dates" array.

2. COLUMN-BY-COLUMN DUTY MAPPING:
   For every date row, check ALL columns:
   - "Base Security Duty" / "Base Secutity Duty" -> dutyCode: "GD" (extract all numbered or listed airmen)
   - "Base Taskforce Duty" -> dutyCode: "BTF"
   - "Najirpara Taskforce Duty" -> dutyCode: "NTF"
   - "Airfield Duty" / "Airport" -> dutyCode: "AIRFIELD_DUTY"
   - "Halishahar Duty" -> dutyCode: "HALISHAHAR"
   - "Bake N Bite" -> dutyCode: "BAKE_N_BITE"
   - "Tdy" / "TDY" -> dutyCode: "TDY"
   - "Leave" -> dutyCode: "LEAVE"
   - "IDA CENTER Duty":
     * "Morning" sub-column -> dutyCode: "IDAC", idaShift: "Morning"
     * "Afternoon" sub-column -> dutyCode: "IDAC", idaShift: "Afternoon"
     * "Night" sub-column -> dutyCode: "IDAC", idaShift: "Night"

3. DATE FORMAT:
   - Target Year is ${targetYear}. Output format: YYYY-MM-DD (e.g. "${targetYear}-08-20").

4. EXCLUDE "Duty Off" and "On Parade" (do not output them).

Return ONLY valid JSON matching this structure:
{
  "documentTitle": "PARADE STATE : AIRMEN 155 UASU BAF",
  "detectedFlight": "Avionics",
  "dates": [
    {
      "date": "${targetYear}-08-20",
      "day": "Thursday",
      "assignments": [
        { "rawText": "Cpl Sajib", "dutyCode": "GD" },
        { "rawText": "LAC Rakib", "dutyCode": "GD" },
        { "rawText": "LAC Mahedi", "dutyCode": "NTF" },
        { "rawText": "Sgt Mustakim", "dutyCode": "AIRFIELD_DUTY" },
        { "rawText": "LAC Joy", "dutyCode": "IDAC", "idaShift": "Morning" },
        { "rawText": "Cpl Koraishi", "dutyCode": "IDAC", "idaShift": "Night" }
      ]
    }
  ]
}`;

      let totalPagesCount = 0;
      const extractedPagesList: Array<{ pageNumber: number; text: string; fileIndex: number }> = [];

      // Extract all pages from all supplied PDF files
      for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
        const fileItem = fileList[fIdx];
        const cleanBase64 = fileItem.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');

        if (buffer.slice(0, 5).toString().includes('%PDF')) {
          const pdfExtracted = await extractAllPagesFromPdf(buffer);
          totalPagesCount += pdfExtracted.totalPages;
          for (const p of pdfExtracted.pages) {
            extractedPagesList.push({
              pageNumber: p.pageNumber,
              text: p.text,
              fileIndex: fIdx,
            });
          }
        } else if (fileItem.name.toLowerCase().endsWith('.docx') || fileItem.name.toLowerCase().endsWith('.doc') || fileItem.mime.includes('word') || fileItem.mime.includes('officedocument')) {
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            const docxText = (result.value || '').trim();
            totalPagesCount += 1;
            extractedPagesList.push({
              pageNumber: 1,
              text: docxText,
              fileIndex: fIdx,
            });
          } catch (mErr) {
            console.error('Mammoth docx parse error:', mErr);
            totalPagesCount += 1;
            extractedPagesList.push({
              pageNumber: 1,
              text: '',
              fileIndex: fIdx,
            });
          }
        } else {
          // Image or other document
          totalPagesCount += 1;
          extractedPagesList.push({
            pageNumber: 1,
            text: '',
            fileIndex: fIdx,
          });
        }
      }

      const combinedTextFromPages = extractedPagesList
        .filter((p) => p.text && p.text.trim())
        .map((p) => `--- [PAGE ${p.pageNumber} OF ${totalPagesCount}] ---\n${p.text}`)
        .join('\n\n');

      const allTextSnippet = [textSnippet || '', combinedTextFromPages].filter(Boolean).join('\n\n');

      let parsedDatesMap = new Map<string, { date: string; day: string; assignments: any[] }>();
      let detectedDocTitle = 'PARADE STATE / DUTY ROSTER';
      let detectedFlight: FlightName | 'Overall' = targetFlight;

      // AI Analysis with Gemini
      if (process.env.GEMINI_API_KEY) {
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];

        // If total pages <= 6: analyze all in one prompt
        // If total pages > 6: chunk into batches of 3-4 pages to guarantee complete coverage
        const pageBatches: Array<{ pageNumbers: number[]; textChunk: string; fileItems: typeof fileList }> = [];

        if (extractedPagesList.length <= 6) {
          pageBatches.push({
            pageNumbers: extractedPagesList.map((p) => p.pageNumber),
            textChunk: allTextSnippet,
            fileItems: fileList,
          });
        } else {
          const batchSize = 4;
          for (let i = 0; i < extractedPagesList.length; i += batchSize) {
            const chunk = extractedPagesList.slice(i, i + batchSize);
            const chunkText = chunk.map((p) => `--- [PAGE ${p.pageNumber} OF ${totalPagesCount}] ---\n${p.text}`).join('\n\n');
            pageBatches.push({
              pageNumbers: chunk.map((p) => p.pageNumber),
              textChunk: chunkText,
              fileItems: [], // Text chunk contains the exact page text
            });
          }
        }

        for (const batch of pageBatches) {
          for (const model of candidateModels) {
            try {
              const ai = getGeminiAI();
              const contents: any[] = [];

              if (batch.fileItems.length > 0 && batch.fileItems[0]?.base64) {
                const cleanBase64 = batch.fileItems[0].base64.replace(/^data:[^;]+;base64,/, '');
                contents.push({
                  inlineData: {
                    mimeType: batch.fileItems[0].mime || 'application/pdf',
                    data: cleanBase64,
                  },
                });
              }

              if (batch.textChunk) {
                contents.push({ text: `Document text transcription (Pages ${batch.pageNumbers.join(', ')}):\n${batch.textChunk}` });
              }

              contents.push({
                text: `CRITICAL INSTRUCTION:
Please analyze ALL pages in this batch (${batch.pageNumbers.join(', ')} of ${totalPagesCount} pages).
Extract EVERY SINGLE DATE ROW and all duty columns (GD, BTF, NTF, Airfield, Halishahar, Bake N Bite, TDY, Leave, IDAC Morning/Afternoon/Night) without stopping early.`,
              });

              const response = await ai.models.generateContent({
                model,
                contents: { parts: contents },
                config: {
                  systemInstruction: systemPrompt,
                  responseMimeType: 'application/json',
                  maxOutputTokens: 16384,
                },
              });

              const responseText = response.text || '';
              const cleanedJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
              const parsed = JSON.parse(cleanedJson);

              if (parsed && Array.isArray(parsed.dates) && parsed.dates.length > 0) {
                if (parsed.documentTitle) detectedDocTitle = parsed.documentTitle;
                if (parsed.detectedFlight) detectedFlight = normalizeFlightName(parsed.detectedFlight);

                for (const dEntry of parsed.dates) {
                  if (!dEntry.date) continue;
                  if (!parsedDatesMap.has(dEntry.date)) {
                    parsedDatesMap.set(dEntry.date, {
                      date: dEntry.date,
                      day: dEntry.day || dEntry.dayName || '',
                      assignments: [],
                    });
                  }
                  const curEntry = parsedDatesMap.get(dEntry.date)!;
                  const rawAsns = Array.isArray(dEntry.assignments) ? dEntry.assignments : [];
                  for (const asn of rawAsns) {
                    const alreadyExists = curEntry.assignments.some(
                      (a) => a.rawText === asn.rawText && a.dutyCode === asn.dutyCode && (asn.dutyCode !== 'IDAC' || a.idaShift === asn.idaShift)
                    );
                    if (!alreadyExists) {
                      curEntry.assignments.push(asn);
                    }
                  }
                }
                break; // Batch succeeded
              }
            } catch (geminiErr) {
              // Try next candidate model
              console.log(`[Gemini Model Batch Note] Trying next model for pages ${batch.pageNumbers.join(', ')}...`);
            }
          }
        }
      }

      // If AI did not extract enough dates or is unavailable, run multi-page heuristic parser across all pages
      if (parsedDatesMap.size === 0 && allTextSnippet.trim()) {
        const heuristicResult = parseRosterTextHeuristically(allTextSnippet, targetYear, targetFlight);
        if (heuristicResult && Array.isArray(heuristicResult.dates)) {
          detectedDocTitle = heuristicResult.documentTitle;
          detectedFlight = heuristicResult.detectedFlight;
          for (const dEntry of heuristicResult.dates) {
            parsedDatesMap.set(dEntry.date, dEntry);
          }
        }
      }

      if (parsedDatesMap.size === 0) {
        return res.status(400).json({
          error: 'No duty dates or personnel assignments could be recognized in the provided document or text. Please check the document format or paste table text directly in the Paste Text / OCR tab.',
        });
      }

      const allDatesList = Array.from(parsedDatesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Post-process, validate and enrich all assignments with local airmen database records
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

          let airman = db.airmen.find((a) => a.id === asn.matchedAirmanId);
          let confidence = asn.confidence || 0.8;

          if (!airman) {
            const match = findBestAirmanMatch(asn.rawText || asn.matchedAirmanName || '', detectedFlight);
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

      const responsePayload = {
        documentTitle: detectedDocTitle,
        detectedFlight: normalizeFlightName(detectedFlight),
        year: targetYear,
        month: 8,
        totalDates: enrichedDates.length,
        totalPages: Math.max(totalPagesCount, 1),
        totalFiles: fileList.length,
        dateRange: {
          start: enrichedDates[0]?.date || `${targetYear}-08-01`,
          end: enrichedDates[enrichedDates.length - 1]?.date || `${targetYear}-08-31`,
        },
        dates: enrichedDates,
        totalAssignmentsCount,
        matchedCount,
        unmatchedCount,
      };

      res.json(responsePayload);
    } catch (err: any) {
      console.error('Error in /api/import/analyze-duty-doc:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze duty document' });
    }
  });

  // 8.1. Direct Load Official 155 UASU Parade State Roster (01 Jul - 31 Aug)
  app.post('/api/import/load-official-roster', (req, res) => {
    try {
      const { targetYear = 2026, monthChoice = 'all' } = req.body || {};
      const doc = getOfficialParadeStateDocument(targetYear, monthChoice, db.airmen);

      let totalAssignmentsCount = 0;
      let matchedCount = 0;
      let unmatchedCount = 0;

      const enrichedDates = (doc.dates || []).map((dateEntry: any) => {
        const enrichedAssignments = (dateEntry.assignments || []).map((asn: any) => {
          totalAssignmentsCount++;
          const airman = db.airmen.find((a) => a.id === asn.matchedAirmanId);
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

      res.json({
        ...doc,
        dates: enrichedDates,
        totalAssignmentsCount,
        matchedCount,
        unmatchedCount,
      });
    } catch (err: any) {
      console.error('Error loading official roster template:', err);
      res.status(500).json({ error: 'Failed to load official roster template' });
    }
  });

  // 9. Apply Approved Imported Duty Data into Duty Register
  app.post('/api/import/apply-duty-data', (req, res) => {
    try {
      const { assignments, sourceDoc = 'PDF Import' } = req.body || {};

      if (!Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({ error: 'No valid assignments provided to import' });
      }

      const affectedDates = new Set<string>();
      const affectedMonths = new Set<string>();
      const importedAssignmentsForBatch: any[] = [];
      const prevAssignmentsForBatch: any[] = [];
      const airmenNamesSet = new Set<string>();

      let appliedCount = 0;

      for (const item of assignments) {
        if (!item.airmanId || !item.date || !item.dutyCode) continue;
        // Exclude Duty Off and On Parade
        if (item.dutyCode === 'ON_PARADE' || item.dutyCode === 'DUTY_OFF') continue;

        const dateStr = item.date;
        const monthKey = dateStr.slice(0, 7);
        affectedDates.add(dateStr);
        affectedMonths.add(monthKey);

        if (!db.assignments[monthKey]) {
          db.assignments[monthKey] = [];
        }

        const list = db.assignments[monthKey];
        const existingIdx = list.findIndex((a) => a.airmanId === item.airmanId && a.date === dateStr);
        const prevItem = existingIdx >= 0 ? { ...list[existingIdx] } : null;

        prevAssignmentsForBatch.push({
          airmanId: item.airmanId,
          date: dateStr,
          dutyCode: prevItem?.dutyCode,
          idaShift: prevItem?.idaShift,
          notes: prevItem?.notes,
        });

        const air = db.airmen.find((a) => a.id === item.airmanId);
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

        // Record individual activity just like standard assign duty
        recordActivity({
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

      if (!db.importHistory) {
        db.importHistory = [];
      }

      const newBatch: ImportHistoryBatch = {
        id: `import-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sourceDoc,
        dutyCount: appliedCount,
        datesCount: affectedDates.size,
        dates: Array.from(affectedDates).sort(),
        airmenNames: Array.from(airmenNamesSet),
        importedAssignments: importedAssignmentsForBatch,
        previousAssignments: prevAssignmentsForBatch,
      };

      db.importHistory.unshift(newBatch);
      if (db.importHistory.length > 50) {
        db.importHistory = db.importHistory.slice(0, 50);
      }

      // Record bulk summary history item
      const sortedDates = Array.from(affectedDates).sort();
      recordActivity({
        actionType: 'IMPORT_PDF_ROSTER',
        airmanId: 'BULK_IMPORT',
        airmanName: `${appliedCount} Duties Imported`,
        dutyCode: 'GD',
        fromDate: sortedDates[0] || '',
        toDate: sortedDates[sortedDates.length - 1] || '',
        notes: `Imported ${appliedCount} active duties across ${affectedDates.size} dates directly into Duty Register (${sourceDoc})`,
      });

      saveDatabase(db, 'ROSTER_UPDATED');

      res.json({
        success: true,
        batchId: newBatch.id,
        appliedCount,
        datesCount: affectedDates.size,
        dates: Array.from(affectedDates),
        message: `Successfully imported ${appliedCount} duty assignments into 155 UASU Duty Register!`,
      });
    } catch (err: any) {
      console.error('Error in /api/import/apply-duty-data:', err);
      res.status(500).json({ error: err.message || 'Failed to apply imported duty data' });
    }
  });

  // Get Import History batches
  app.get('/api/import/history', (req, res) => {
    res.json({ history: db.importHistory || [] });
  });

  // Revert a complete import batch
  app.post('/api/import/revert-batch', (req, res) => {
    try {
      const { batchId } = req.body || {};
      if (!batchId) return res.status(400).json({ error: 'Missing batchId' });

      if (!db.importHistory) {
        return res.status(404).json({ error: 'No import history found' });
      }

      const idx = db.importHistory.findIndex((b) => b.id === batchId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Import batch not found' });
      }

      const batch = db.importHistory[idx];

      // Restore previous assignments or remove the imported assignments
      if (batch.previousAssignments && batch.previousAssignments.length > 0) {
        for (const prev of batch.previousAssignments) {
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
      } else if (batch.importedAssignments && batch.importedAssignments.length > 0) {
        for (const imp of batch.importedAssignments) {
          const mKey = imp.date.slice(0, 7);
          if (db.assignments[mKey]) {
            db.assignments[mKey] = db.assignments[mKey].filter(
              (a) => !(a.airmanId === imp.airmanId && a.date === imp.date && a.dutyCode === imp.dutyCode)
            );
          }
        }
      }

      db.importHistory.splice(idx, 1);
      saveDatabase(db, 'ROSTER_UPDATED');

      res.json({
        success: true,
        message: `Successfully reverted import batch (${batch.sourceDoc || batch.id}) with ${batch.dutyCount} duties.`,
      });
    } catch (err: any) {
      console.error('Error in /api/import/revert-batch:', err);
      res.status(500).json({ error: err.message || 'Failed to revert import batch' });
    }
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
