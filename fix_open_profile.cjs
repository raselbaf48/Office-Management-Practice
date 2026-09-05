const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const openProfile = (user: any) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password);
    setEditAdminPass(user.adminPass);
    setIsEditingProfile(false);
  };`;

const replacement = `  const openProfile = (user: any) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password || '');
    setEditAdminPass(user.adminPass || '');
    setEditName(user.airman?.name || user.name || '');
    setEditRank(user.airman?.rank || user.rank || '');
    setEditFlight(user.airman?.flightName || user.flightName || '');
    setEditMobile(user.airman?.mobileNo || user.mobileNo || '');
    setIsEditingProfile(false);
  };`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("openProfile fixed");
