const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update saveProfile
const oldSaveProfilePattern = "const saveProfile = () => {";
const endSaveProfilePattern = "setIsEditingProfile(false);\n  };";
const saveStartIndex = content.indexOf(oldSaveProfilePattern);
const saveEndIndex = content.indexOf(endSaveProfilePattern, saveStartIndex) + endSaveProfilePattern.length;

if (saveStartIndex !== -1 && saveEndIndex !== -1) {
  const newSaveProfile = `const saveProfile = () => {
    if (!selectedUser) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const existingIdx = updatedDetailedUsers.findIndex(u => u.bdNo === selectedUser.cleanBd);
    
    const newDetail: DetailedUserLogin = {
      id: \`user-login-\${selectedUser.cleanBd}\`,
      bdNo: selectedUser.cleanBd,
      name: editName,
      rank: editRank,
      flightName: editFlight,
      mobileNo: editMobile,
      trade: selectedUser.airman?.trade || selectedUser.trade || '',
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
      detailedAt: new Date().toISOString(),
      detailedBy: 'Admin',
      detailOrder: 'Updated via Admin Panel'
    };
    
    if (existingIdx >= 0) {
      newDetail.id = updatedDetailedUsers[existingIdx].id;
      newDetail.detailedAt = updatedDetailedUsers[existingIdx].detailedAt;
      newDetail.detailOrder = updatedDetailedUsers[existingIdx].detailOrder;
      newDetail.airmanId = updatedDetailedUsers[existingIdx].airmanId;
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    
    // update authSession
    if (typeof (window as any).updateUserDetails === 'function') {
      (window as any).updateUserDetails(selectedUser.cleanBd, { name: editName, rank: editRank, flightName: editFlight, mobileNo: editMobile });
    }
    
    setIsEditingProfile(false);
  };`;
  content = content.substring(0, saveStartIndex) + newSaveProfile + content.substring(saveEndIndex);
}

// 2. Add inputs to profile UI
// I will replace the Profile Details section completely.
const uiStartStr = `<h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <UserCog className="w-6 h-6 text-emerald-500" />
                  Profile Details
                </h3>`;
const uiEndStr = `<div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">`;

const uiStartIndex = content.indexOf(uiStartStr);
const uiEndIndex = content.indexOf(uiEndStr);

if (uiStartIndex !== -1 && uiEndIndex !== -1) {
  const newUI = `<h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <UserCog className="w-6 h-6 text-emerald-500" />
                  Profile Details
                </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">User ID (BD No)</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.cleanBd}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Rank</p>
                  {isEditingProfile ? (
                    <input type="text" value={editRank} onChange={(e) => setEditRank(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.rank || selectedUser.rank || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Name</p>
                  {isEditingProfile ? (
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.name || selectedUser.name || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Flight / Branch</p>
                  {isEditingProfile ? (
                    <input type="text" value={editFlight} onChange={(e) => setEditFlight(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.flightName || selectedUser.flightName || '-'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Mobile No</p>
                  {isEditingProfile ? (
                    <input type="text" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm" />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.mobileNo || selectedUser.mobileNo || '-'}</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-6"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                  {isEditingProfile && selectedUser.cleanBd !== '48456' ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value as any)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                      <option value="USER">Standard User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.role}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Account Status</label>
                  {isEditingProfile && selectedUser.cleanBd !== '48456' ? (
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.status}</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Login Password</label>
                  {isEditingProfile ? (
                    <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                  ) : (
                    <p className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{selectedUser.password || selectedUser.cleanBd}</p>
                  )}
                </div>
                
                {editRole === 'ADMIN' || editRole === 'SUPER_ADMIN' || selectedUser.role === 'ADMIN' || selectedUser.role === 'SUPER_ADMIN' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Admin Portal Password</label>
                    {isEditingProfile ? (
                      <input type="text" value={editAdminPass} onChange={(e) => setEditAdminPass(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                    ) : (
                      <p className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{selectedUser.adminPass || (selectedUser.cleanBd === '48456' ? '1124' : 'N/A')}</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            
            `;
  content = content.substring(0, uiStartIndex) + newUI + content.substring(uiEndIndex);
}

// 3. Add Role Filter UI next to search bar
const searchBarStr = `<div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by BD No or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>`;

if (content.includes(searchBarStr)) {
  const newSearchBar = `<div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by BD No or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value as any)} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>`;
  content = content.replace(searchBarStr, newSearchBar);
}

// 4. Fix row serial number (idx + 1)
const rowRegex = /<td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">\{user\.airman\?\.serNo \|\| '-'}<\/td>/;
content = content.replace(rowRegex, `<td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">{idx + 1}</td>`);


fs.writeFileSync(file, content);
console.log("User management updated!");
