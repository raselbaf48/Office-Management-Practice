const fs = require('fs');
let file = fs.readFileSync('src/utils/authSession.ts', 'utf-8');

if (!file.includes('changeAdminPassword')) {
  file = file.replace(
    'export const changeUserRole',
    `export const changeAdminPassword = (bdNo: string, currentPass: string, newPass: string, isSuperAdmin: boolean = false): { success: boolean; message: string } => {
  const clean = bdNo.replace(/^BD\\/?/i, '').trim().toLowerCase();
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

export const changeUserRole`
  );
  fs.writeFileSync('src/utils/authSession.ts', file, 'utf-8');
}
