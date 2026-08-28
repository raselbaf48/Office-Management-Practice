import { localDb } from './localDatabase';

/**
 * Universal API Bridge & Fallback Interceptor
 * Ensures that all data operations (Parade State, Duty Assignment, Leave, TDY,
 * Airmen CRUD, Duty Roster, Analytics, Settings) work seamlessly on Vercel,
 * static deployments, and offline environments.
 */

export function installApiInterceptor() {
  if (typeof window === 'undefined' || (window as any).__baf_interceptor_installed) {
    return;
  }

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  if (!originalFetch) return;

  const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept /api/* routes
    if (urlStr.startsWith('/api/') || urlStr.startsWith('api/') || urlStr.includes('/api/')) {
      try {
        const networkResponse = await originalFetch(input, init);
        const contentType = networkResponse.headers.get('content-type') || '';

        // If the server responded with valid JSON and not 404/500/HTML
        if (networkResponse.ok && contentType.includes('application/json')) {
          return networkResponse;
        }
      } catch (networkErr) {
        // Backend unavailable (e.g. Vercel static hosting) -> handle via local engine
      }

      // Handle locally
      return handleLocalApiRequest(urlStr, init);
    }

    return originalFetch(input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true,
    });
    (window as any).__baf_interceptor_installed = true;
    console.log('✅ BAF 155 UASU Local Data & Vercel Bridge Active');
  } catch (err) {
    try {
      (window as any).fetch = customFetch;
      (window as any).__baf_interceptor_installed = true;
    } catch (fallbackErr) {
      console.warn('Could not override window.fetch:', fallbackErr);
    }
  }
}

async function handleLocalApiRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const pathname = url.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  const searchParams = url.searchParams;

  let body: any = null;
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }

  try {
    // 1. Health
    if (pathname === '/api/health') {
      return jsonResponse({ status: 'ok', engine: 'client-bridge', personnelCount: localDb.getAirmen().length });
    }

    // 2. Airmen CRUD
    if (pathname === '/api/airmen') {
      if (method === 'GET') {
        const flight = searchParams.get('flight') || undefined;
        const rank = searchParams.get('rank') || undefined;
        const search = searchParams.get('search') || undefined;
        const airmen = localDb.getAirmen({ flight, rank, search });
        return jsonResponse(airmen);
      }
      if (method === 'POST') {
        const newAirman = localDb.addAirman(body);
        return jsonResponse(newAirman, 201);
      }
    }

    if (pathname.startsWith('/api/airmen/')) {
      const id = pathname.replace('/api/airmen/', '');
      if (method === 'PUT') {
        const updated = localDb.updateAirman(id, body);
        return updated ? jsonResponse(updated) : jsonResponse({ error: 'Airman not found' }, 404);
      }
      if (method === 'DELETE') {
        const ok = localDb.deleteAirman(id);
        return ok ? jsonResponse({ success: true }) : jsonResponse({ error: 'Airman not found' }, 404);
      }
    }

    // 3. Duty Types
    if (pathname === '/api/duty-types') {
      const { DUTY_TYPES } = await import('../data/dutyTypes');
      return jsonResponse(DUTY_TYPES);
    }

    // 4. Roster
    if (pathname === '/api/roster') {
      const month = searchParams.get('month') || undefined;
      const data = localDb.getRoster(month);
      return jsonResponse(data);
    }

    if (pathname === '/api/roster/year') {
      const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
      const data = localDb.getRosterYear(year);
      return jsonResponse(data);
    }

    // 5. Duty Assignment Actions
    if (pathname === '/api/roster/assign') {
      const { monthKey, assignment } = body || {};
      const targetMonth = monthKey || assignment?.date?.slice(0, 7);
      const res = localDb.assignDuty(targetMonth, assignment);
      return jsonResponse({ success: true, assignment: res });
    }

    if (pathname === '/api/roster/assign-range') {
      const res = localDb.assignRange(body);
      return jsonResponse({ success: true, ...res });
    }

    if (pathname === '/api/roster/batch-assign') {
      const res = localDb.batchAssign(body);
      return jsonResponse({ success: true, message: `Assigned ${res.count} duties successfully!`, ...res });
    }

    if (pathname === '/api/roster/delete-assignment') {
      const { airmanId, date } = body || {};
      localDb.deleteAssignment(airmanId, date);
      return jsonResponse({ success: true });
    }

    if (pathname === '/api/roster/delete-range') {
      const count = localDb.deleteRange(body);
      return jsonResponse({ success: true, count });
    }

    // 6. Parade State & PT State
    if (pathname === '/api/parade-state') {
      const date = searchParams.get('date') || undefined;
      const shift = (searchParams.get('shift') as any) || 'Morning';
      const flight = (searchParams.get('flight') as any) || 'Overall';
      const stateType = searchParams.get('stateType') || searchParams.get('documentType') || 'PARADE';
      const paradeData = localDb.getParadeState({ date, shift, flight, stateType });
      return jsonResponse(paradeData);
    }

    // 7. Analytics
    if (pathname === '/api/analytics') {
      const month = searchParams.get('month') || undefined;
      const analytics = localDb.getAnalytics(month);
      return jsonResponse(analytics);
    }

    // 8. History
    if (pathname === '/api/roster/history') {
      const history = localDb.getHistory();
      return jsonResponse({ history });
    }

    if (pathname === '/api/roster/undo-history') {
      const { historyId } = body || {};
      const ok = localDb.undoHistory(historyId);
      return jsonResponse({ success: ok });
    }

    // 9. Auth & Passcode
    if (pathname === '/api/auth/verify') {
      const { passcode } = body || {};
      const ok = localDb.verifyPasscode(passcode);
      if (ok) return jsonResponse({ success: true, role: 'ADMIN' });
      return jsonResponse({ success: false, error: 'Incorrect passcode' }, 401);
    }

    if (pathname === '/api/auth/change-passcode') {
      const { currentPasscode, newPasscode } = body || {};
      const ok = localDb.changePasscode(currentPasscode, newPasscode);
      if (ok) return jsonResponse({ success: true, message: 'Passcode changed' });
      return jsonResponse({ error: 'Passcode update failed' }, 400);
    }

    // 10. Document & PDF Import Endpoints
    if (pathname === '/api/import/analyze-duty-doc') {
      const result = localDb.analyzeDutyDocument(body);
      return jsonResponse(result);
    }

    if (pathname === '/api/import/load-official-roster') {
      const { targetYear, monthChoice } = body || {};
      const result = localDb.loadOfficialRoster(targetYear, monthChoice);
      return jsonResponse(result);
    }

    if (pathname === '/api/import/apply-duty-data') {
      const { assignments, sourceDoc } = body || {};
      const result = localDb.applyDutyData(assignments, sourceDoc);
      return jsonResponse({ success: true, ...result });
    }

    if (pathname === '/api/import/history') {
      const history = localDb.getImportHistory();
      return jsonResponse({ history });
    }

    if (pathname.startsWith('/api/import/history/')) {
      const batchId = pathname.replace('/api/import/history/', '');
      const ok = localDb.deleteImportHistory(batchId);
      return jsonResponse({ success: ok });
    }

    if (pathname === '/api/import/revert-batch') {
      const { batchId } = body || {};
      const ok = localDb.deleteImportHistory(batchId);
      return jsonResponse({ success: ok });
    }

    // 11. Database Backup & Restore
    if (pathname === '/api/database/export' || pathname === '/api/database/backup') {
      const exportJson = localDb.exportDatabase();
      return new Response(exportJson, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="155_uasu_duty_database.json"',
        },
      });
    }

    if (pathname === '/api/database/restore') {
      const ok = localDb.restoreDatabase(body);
      return ok ? jsonResponse({ success: true, message: 'Database restored successfully' }) : jsonResponse({ error: 'Invalid restore payload' }, 400);
    }

    // 12. SSE Realtime Event stub for static frontend
    if (pathname === '/api/realtime/events') {
      return new Response('data: {"type":"CONNECTED"}\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }

    // Default fallback: return empty object or success
    return jsonResponse({ success: true, message: 'Handled by Local Bridge' });
  } catch (err: any) {
    console.error('Local Bridge API Error:', err);
    return jsonResponse({ error: err.message || 'Internal local bridge error' }, 500);
  }
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Served-By': 'BAF-Local-Bridge',
    },
  });
}
