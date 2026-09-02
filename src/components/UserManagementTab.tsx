import React, { useState, useMemo, useEffect } from 'react';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus } from '../types';
import { Search, ChevronLeft, Save, ShieldCheck, Settings } from 'lucide-react';
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
  
  const isAdmin = userSessionRole === 'ADMIN' || userSessionRole === 'SUPER_ADMIN';
  const isOwner = userSessionRole === 'SUPER_ADMIN';
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editRole, setEditRole] = useState<UserLoginRole>('USER');
  const [editStatus, setEditStatus] = useState<UserLoginStatus>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');

  const mergedUsers = useMemo(() => {
    const combined = nominalAirmen.map(airman => {
      const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
      const dbUser = detailedUsers.find(u => u.bdNo === cleanBd);
      return {
        ...airman,
        cleanBd,
        role: dbUser?.role || 'USER',
        status: dbUser?.status || 'ACTIVE',
        password: dbUser?.password || cleanBd,
        adminPass: dbUser?.adminPass || '',
        isDefaultOwner: (dbUser as any)?.isDefaultOwner || false,
        lastLogin: dbUser?.lastLoginAt,
        detailed: dbUser,
        airman
      };
    });
    
    const independentUsers = detailedUsers
      .filter(u => !combined.some(c => c.cleanBd === u.bdNo))
      .map(u => ({
        id: `indep-${u.bdNo}`,
        cleanBd: u.bdNo,
        bdNo: u.bdNo,
        name: u.name,
        rank: u.rank,
        mobileNo: u.mobileNo || '',
        flight: u.flightName || '',
        role: u.role,
        status: u.status,
        password: u.password || u.bdNo,
        adminPass: u.adminPass || '',
        isDefaultOwner: (u as any).isDefaultOwner || false,
        lastLogin: u.lastLoginAt,
        detailed: u,
        airman: {
          rank: u.rank,
          name: u.name
        }
      }));
    
    let filtered = [...combined, ...independentUsers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.cleanBd.toLowerCase().includes(q) || 
        u.name.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (flightFilter !== 'ALL') {
      filtered = filtered.filter(u => (u.flight || u.flightName) === flightFilter);
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
    setEditPassword(user.password);
    setEditAdminPass(user.adminPass);
    setIsEditingProfile(false);
  };

  const closeProfile = () => {
    setSelectedUser(null);
    setIsEditingProfile(false);
  };

  const handleAddUser = () => {
    if (!newUser.bdNo || !newUser.name || !newUser.password) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const newDetail: DetailedUserLogin = {
      id: `user-login-${newUser.bdNo}`,
      bdNo: newUser.bdNo,
      name: newUser.name,
      rank: newUser.rank || '',
      mobileNo: newUser.mobileNo || '',
      flightName: 'Admin', // default or ask
      trade: '',
      role: newUser.role,
      status: 'ACTIVE',
      password: newUser.password,
      adminPass: '',
      detailedAt: new Date().toISOString(),
      detailedBy: 'System',
    };
    
    const existingIdx = updatedDetailedUsers.findIndex(u => u.bdNo === newDetail.bdNo);
    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    
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
      name: selectedUser.airman?.name || selectedUser.name || '',
      rank: selectedUser.airman?.rank || selectedUser.rank || '',
      flightName: selectedUser.airman?.flightName || selectedUser.flight || '',
      trade: selectedUser.airman?.trade || selectedUser.trade || '',
      mobileNo: selectedUser.airman?.mobileNo || selectedUser.mobileNo || '',
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
      detailedAt: new Date().toISOString(),
      detailedBy: 'System',
    };
    
    // preserve fields
    if (existingIdx >= 0) {
      newDetail.ownerPass = updatedDetailedUsers[existingIdx].ownerPass;
      newDetail.lastLoginAt = updatedDetailedUsers[existingIdx].lastLoginAt;
      newDetail.detailOrder = updatedDetailedUsers[existingIdx].detailOrder;
      (newDetail as any).isDefaultOwner = (updatedDetailedUsers[existingIdx] as any).isDefaultOwner;
    }

    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    closeProfile();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {isAddingUser ? (
            <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : selectedUser ? (
            <button onClick={closeProfile} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAddingUser ? 'Add Independent User' : selectedUser ? 'User Profile' : 'User Management'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isAddingUser ? 'Create a new standalone user account' : selectedUser ? `BD/${selectedUser.cleanBd} - ${selectedUser.airman?.rank || ''} ${selectedUser.airman?.name || selectedUser.name || ''}` : 'Manage roles, PINs, and access for all nominal airmen'}
            </p>
          </div>
        </div>
        {!isAddingUser && !selectedUser && isOwner && (
          <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all">
            + Add User
          </button>
        )}
      </div>

      {isAddingUser ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start">
          <div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User ID (BD No) <span className="text-rose-500">*</span></label>
                <input type="text" value={newUser.bdNo} onChange={(e) => setNewUser({...newUser, bdNo: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="e.g. 123456" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name <span className="text-rose-500">*</span></label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" placeholder="Full Name" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User PIN <span className="text-rose-500">*</span></label>
              <input type="text" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full md:w-1/2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-mono text-slate-900 dark:text-white" placeholder="User PIN" />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setIsAddingUser(false)} className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
              <button onClick={handleAddUser} className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold"><Save className="w-5 h-5" /><span>Save User</span></button>
            </div>
          </div>
        </div>
      ) : selectedUser ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start">
          <div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile Details</h3>
                {isOwner && (
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`p-1.5 rounded-lg ${isEditingProfile ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400'}`}>
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Ser No</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.serNo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">User ID (BD No)</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.cleanBd}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Rank & Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.rank} {selectedUser.airman?.name || selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Trade</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.trade || selectedUser.trade || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Mobile No</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.mobileNo || selectedUser.mobileNo || '-'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Flight</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.airman?.flightName || selectedUser.flight || '-'}</p>
                </div>
                {isOwner && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">User PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.password}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Admin PIN</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{selectedUser.adminPass || '-'}</p>
                    </div>
                  </>
                )}
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Current Role</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.role}</p>
                </div>
              </div>
            </div>

            {isEditingProfile && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-6 mb-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase">Account Role</label>
                  <div className="flex space-x-3">
                    <button onClick={() => setEditRole('USER')} className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'USER' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>User</button>
                    <button onClick={() => setEditRole('ADMIN')} className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'ADMIN' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>Admin</button>
                    <button disabled={!isOwner} onClick={() => setEditRole('SUPER_ADMIN')} className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${editRole === 'SUPER_ADMIN' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>Owner</button>
                  </div>
                </div>
                {isOwner && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">User PIN</label>
                      <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono dark:text-white" />
                    </div>
                    {(editRole === 'ADMIN' || editRole === 'SUPER_ADMIN') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Admin PIN</label>
                        <input type="text" value={editAdminPass} onChange={(e) => setEditAdminPass(e.target.value)} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono dark:text-white" />
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Account Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as UserLoginStatus)} className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 dark:text-white">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              {isEditingProfile ? (
                <>
                  <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold">Cancel</button>
                  <button onClick={saveProfile} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold">Save Changes</button>
                </>
              ) : (
                <button onClick={closeProfile} className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold">Close</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">SER NO</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">USER ID</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">RANK & NAME</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-xs">ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mergedUsers.map((user, idx) => (
                <tr 
                  key={user.cleanBd || idx} 
                  onClick={() => openProfile(user)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.airman?.serNo || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{user.cleanBd}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.airman?.rank} {user.airman?.name || user.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
