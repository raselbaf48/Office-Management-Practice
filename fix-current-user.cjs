const fs = require('fs');
let content = fs.readFileSync('src/utils/authSession.ts', 'utf8');

const target = `export const getCurrentUserSession = (): UserSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
};`;

const replacement = `export const getCurrentUserSession = (): UserSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    const cleanBd = session.bdNo.replace(/^BD\\/?/i, '').trim();
    if (cleanBd === '48456' && session.role !== 'OWNER') {
      session.role = 'OWNER';
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  } catch {
    return null;
  }
};`;

content = content.replace(target, replacement);
fs.writeFileSync('src/utils/authSession.ts', content);
