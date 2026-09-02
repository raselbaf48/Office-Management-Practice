import fs from 'fs';

const filePath = 'src/utils/authSession.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regex = /export const getDetailedUsers = \(nominalAirmen: Airman\[\] = \[\]\): DetailedUserLogin\[\] => \{[\s\S]*?return defaults;\n  \}\n\n  \/\/ Fallback single primary user/m;

const replacement = `export const getDetailedUsers = (nominalAirmen: Airman[] = []): DetailedUserLogin[] => {
  let parsed: DetailedUserLogin[] = [];
  try {
    const raw = localStorage.getItem(DETAILED_USERS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length > 0) {
        parsed = p;
      }
    }
  } catch (e) {
    console.warn('Failed to parse detailed user logins:', e);
  }

  let modified = false;

  // Enforce System Owners
  const enforceOwner = (owner: DetailedUserLogin, bdNo: string, pass: string, adminPass: string) => {
    const idx = parsed.findIndex(u => u.bdNo === bdNo);
    if (idx === -1) {
      parsed.push(owner);
      modified = true;
    } else {
      if (parsed[idx].role !== 'SUPER_ADMIN' || parsed[idx].password !== pass || parsed[idx].adminPass !== adminPass) {
        parsed[idx].role = 'SUPER_ADMIN';
        parsed[idx].password = pass;
        parsed[idx].adminPass = adminPass;
        modified = true;
      }
    }
  };

  enforceOwner(SYSTEM_OWNER, '53539919', '54549919', '1124');
  enforceOwner(SYSTEM_OWNER_NEW, '48456', '48456', '51519919');

  // Auto-sync Nominal Roll users into User Management
  if (nominalAirmen && nominalAirmen.length > 0) {
    nominalAirmen.forEach((a) => {
      const cleanBd = a.bdNo.replace(/^BD\\/?/i, '').trim();
      const idx = parsed.findIndex(u => u.bdNo.toLowerCase() === cleanBd.toLowerCase());
      
      if (idx === -1) {
        // Create auto profile for nominal roll airman
        const isPrimary = cleanBd === '474455';
        parsed.push({
          id: \`user-login-\${cleanBd}\`,
          airmanId: a.id,
          bdNo: cleanBd,
          rank: a.rank,
          name: a.name,
          mobileNo: a.mobileNo,
          flightName: a.flightName,
          trade: a.trade,
          role: isPrimary ? 'SUPER_ADMIN' : 'USER',
          password: cleanBd,
          adminPass: isPrimary ? '1124' : '',
          status: a.active ? 'ACTIVE' : 'SUSPENDED',
          detailOrder: isPrimary ? 'DO-155/ADMIN/01' : 'DO-155/GEN/2026',
          detailedAt: new Date().toISOString(),
          detailedBy: 'System Auto Sync',
          remarks: 'Auto-synced from Nominal Roll',
        });
        modified = true;
      } else {
        // Suspend user if they are inactive in nominal roll
        if (!a.active && parsed[idx].status === 'ACTIVE') {
          parsed[idx].status = 'SUSPENDED';
          modified = true;
        }
      }
    });
  }

  if (modified) {
    try { localStorage.setItem(DETAILED_USERS_KEY, JSON.stringify(parsed)); } catch {}
  }

  if (parsed.length > 0) {
    return parsed;
  }

  // Fallback single primary user`;

code = code.replace(regex, replacement);
fs.writeFileSync(filePath, code);
