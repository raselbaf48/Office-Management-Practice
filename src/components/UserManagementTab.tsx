import React, { useState, useMemo, useEffect } from 'react';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus } from '../types';
import { Search, ChevronLeft, Save, ShieldCheck, Settings, UserCog } from 'lucide-react';
import { getDetailedUsers, saveDetailedUsers } from '../utils/authSession';

interface UserManagementTabProps {
  nominalAirmen: Airman[];
  userSessionRole?: string;
  userFlight?: string;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  nominalAirmen,
  userSessionRole,
  userFlight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [flightFilter, setFlightFilter] = useState<string>('ALL');
  
  const [detailedUsers, setDetailedUsers] = useState<DetailedUserLogin[]>(() => getDetailedUsers(nominalAirmen));
  
  useEffect(() => {
    const handleDetailedUsersChange = (e: any) => {
      setDetailedUsers(e.detail);
    };
    window.addEventListener('baf_detailed_users_changed', handleDetailedUsersChange);
    return () => window.removeEventListener('baf_detailed_users_changed', handleDetailedUsersChange);
  }, []);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ bdNo: '', name: '', rank: '', mobileNo: '', role: 'USER' as UserLoginRole, password: '' });

  const isAdmin = userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'ADMIN';
  const isSuperAdmin = userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'OWNER';
  const isOwner = userSessionRole === 'OWNER';

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editRole, setEditRole] = useState<UserLoginRole>('USER');
  const [editStatus, setEditStatus] = useState<UserLoginStatus>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');
  const [editName, setEditName] = useState('');
  const [editRank, setEditRank] = useState('');
  const [editFlight, setEditFlight] = useState('');
  const [editMobile, setEditMobile] = useState('');

  const mergedUsers = useMemo(() => {
    const usersMap = new Map();
    
    // Detailed Users
    detailedUsers.forEach(du => {
      usersMap.set(du.bdNo, { ...du, cleanBd: du.bdNo });
    });

    // Nominal Airmen
    nominalAirmen.forEach(a => {
      const cleanBd = a.bdNo.replace(/^BD\/?/i, '').trim();
      if (usersMap.has(cleanBd)) {
        usersMap.set(cleanBd, { ...usersMap.get(cleanBd), airman: a });
      } else {
        usersMap.set(cleanBd, {
          id: `user-login-${cleanBd}`,
          airmanId: a.id,
          cleanBd,
          bdNo: cleanBd,
          rank: a.rank,
          name: a.name,
          flightName: a.flightName,
          trade: a.trade,
          role: 'USER',
          status: 'ACTIVE',
          password: '',
          adminPass: '',
          detailedAt: new Date().toISOString(),
          detailedBy: 'System',
          detailOrder: 'Nominal Roll',
          airman: a,
        });
      }
    });

    let filtered = Array.from(usersMap.values());
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.cleanBd.toLowerCase().includes(q) || 
        u.name?.toLowerCase().includes(q) ||
        u.airman?.name?.toLowerCase().includes(q)
      );
    }
    
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (flightFilter !== 'ALL') {
      filtered = filtered.filter(u => (u.flight || u.flightName || u.airman?.flightName) === flightFilter);
    }
    
    return filtered.sort((a, b) => {
      if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') return -1;
      if (a.role !== 'SUPER_ADMIN' && b.role === 'SUPER_ADMIN') return 1;
      return 0;
    });
  }, [nominalAirmen, detailedUsers, searchQuery, roleFilter, flightFilter]);

  const uniqueFlights = useMemo(() => {
    return Array.from(new Set(nominalAirmen.map(a => a.flightName))).filter(Boolean).sort();
  }, [nominalAirmen]);

  const openProfile = (user: any) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password || '');
    setEditAdminPass(user.adminPass || '');
    setEditName(user.name || user.airman?.name || '');
    setEditRank(user.rank || user.airman?.rank || '');
    setEditFlight(user.airman?.flightName || user.flightName || '');
    setEditMobile(user.airman?.mobileNo || user.mobileNo || '');
    setIsEditingProfile(false);
  };

  const closeProfile = () => {
    setSelectedUser(null);
    setIsEditingProfile(false);
  };

  const handleAddUser = () => {
    if (!newUser.bdNo.trim() || !newUser.name.trim()) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const newDetail: DetailedUserLogin = {
      id: `user-login-${newUser.bdNo.trim()}-${Date.now()}`,
      bdNo: newUser.bdNo.trim().replace(/^BD\/?/i, ''),
      name: newUser.name,
      rank: newUser.rank,
      mobileNo: newUser.mobileNo,
      role: newUser.role,
      status: 'ACTIVE',
      password: newUser.password,
      detailedAt: new Date().toISOString(),
      detailedBy: 'System',
      flightName: '',
      trade: '',
    };
    
    const existingIdx = updatedDetailedUsers.findIndex(u => u.bdNo === newDetail.bdNo);
    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    
    setIsAddingUser(false);
    setNewUser({ bdNo: '', name: '', rank: '', mobileNo: '', role: 'USER', password: '' });
  };

  const saveProfile = () => {
    if (!selectedUser) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const existingIdx = updatedDetailedUsers.findIndex(u => u.bdNo === selectedUser.cleanBd);
    
    const newDetail: DetailedUserLogin = {
      id: `user-login-${selectedUser.cleanBd}`,
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
    
    if (typeof (window as any).updateUserDetails === 'function') {
      (window as any).updateUserDetails(selectedUser.cleanBd, { name: editName, rank: editRank, flightName: editFlight, mobileNo: editMobile });
    }
    
    setIsEditingProfile(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {selectedUser ? (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 animate-fadeIn">
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <button onClick={closeProfile} className="p-2 -ml-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{selectedUser.name || selectedUser.airman?.name}</h2>
              <p className="text-xs font-bold text-slate-500">{selectedUser.cleanBd}</p>
            </div>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
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
                      <input type="text" value={editRank} onChange={(e) => setEditRank(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm outline-none text-slate-900 dark:text-white" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.rank || selectedUser.airman?.rank || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Name</p>
                    {isEditingProfile ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm outline-none text-slate-900 dark:text-white" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.name || selectedUser.airman?.name || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Flight / Branch</p>
                    {isEditingProfile ? (
                      <input type="text" value={editFlight} onChange={(e) => setEditFlight(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm outline-none text-slate-900 dark:text-white" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.flightName || selectedUser.airman?.flightName || '-'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Mobile No</p>
                    {isEditingProfile ? (
                      <input type="text" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm outline-none text-slate-900 dark:text-white" />
                    ) : (
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.mobileNo || selectedUser.airman?.mobileNo || '-'}</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-6"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                    {isEditingProfile && selectedUser.cleanBd !== '48456' ? (
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value as any)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none">
                        <option value="USER">Standard User</option>
                        <option value="ADMIN">Admin</option>
                        {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.role}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Account Status</label>
                    {isEditingProfile && selectedUser.cleanBd !== '48456' ? (
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none">
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
                      <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none" />
                    ) : (
                      <p className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{selectedUser.password || selectedUser.cleanBd}</p>
                    )}
                  </div>
                  
                  {editRole === 'ADMIN' || editRole === 'SUPER_ADMIN' || selectedUser.role === 'ADMIN' || selectedUser.role === 'SUPER_ADMIN' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Admin Portal Password</label>
                      {isEditingProfile ? (
                        <input type="text" value={editAdminPass} onChange={(e) => setEditAdminPass(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none" />
                      ) : (
                        <p className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">{selectedUser.adminPass || (selectedUser.cleanBd === '48456' ? '1124' : 'N/A')}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                {isEditingProfile ? (
                  <>
                    <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300">Cancel</button>
                    <button onClick={saveProfile} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={closeProfile} className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors">Close</button>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">User Directory</h2>
              <p className="text-xs font-bold text-slate-500">Manage {mergedUsers.length} total users</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative max-w-sm w-full">
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none h-10"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors whitespace-nowrap">
                Add New User
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ser No</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">BD No</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mergedUsers.map((user, idx) => (
                    <tr 
                      key={user.cleanBd || idx} 
                      onClick={() => openProfile(user)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{user.cleanBd}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.rank || user.airman?.rank} {user.name || user.airman?.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {mergedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add New User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Add New User</h4>
            <div className="space-y-4">
              <input type="text" placeholder="BD No" value={newUser.bdNo} onChange={e => setNewUser({...newUser, bdNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Rank" value={newUser.rank} onChange={e => setNewUser({...newUser, rank: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Mobile No" value={newUser.mobileNo} onChange={e => setNewUser({...newUser, mobileNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <input type="text" placeholder="Password (Optional)" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAddingUser(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAddUser} disabled={!newUser.bdNo || !newUser.name} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors">Add User</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
