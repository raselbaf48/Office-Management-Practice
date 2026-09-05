const fs = require('fs');
const file = 'src/utils/authSession.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Force remove 53539919
if (!content.includes("u.bdNo !== '53539919'")) {
  const getDetailedUsersBody = `
  let modified = false;

  // Force remove specific user
  const beforeCount = parsed.length;
  parsed = parsed.filter(u => u.bdNo !== '53539919');
  if (parsed.length !== beforeCount) {
    try { localStorage.setItem(DETAILED_USERS_KEY, JSON.stringify(parsed)); } catch {}
  }`;
  content = content.replace("let modified = false;", getDetailedUsersBody);
}

// 2. Add updateUserDetails
if (!content.includes("export const updateUserDetails =")) {
  content += `

export const updateUserDetails = (bdNo: string, updates: { name?: string, rank?: string, flightName?: string, mobileNo?: string }): DetailedUserLogin | null => {
  const clean = bdNo.replace(/^BD\\/?/i, '').trim().toLowerCase();
  const current = getDetailedUsers();
  const idx = current.findIndex((u) => u.bdNo.toLowerCase() === clean);
  
  if (idx === -1) return null;

  if (updates.name !== undefined) current[idx].name = updates.name;
  if (updates.rank !== undefined) current[idx].rank = updates.rank;
  if (updates.flightName !== undefined) current[idx].flightName = updates.flightName;
  if (updates.mobileNo !== undefined) current[idx].mobileNo = updates.mobileNo;
  
  saveDetailedUsers(current);
  return current[idx];
};
`;
}

fs.writeFileSync(file, content);
console.log("authSession updated");
