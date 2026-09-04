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
  const PORT = 3000;

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
        airmen: newAirmen
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
        const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];

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
            } catch (geminiErr: any) {
              // Try next candidate model
              console.log(`[Gemini Model Batch Note] Model ${model} failed for pages ${batch.pageNumbers.join(', ')}:`, geminiErr.message);
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
  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { port: 24678 }
      },
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
