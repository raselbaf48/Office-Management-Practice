import React, { useState, useMemo, useEffect } from 'react';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus } from '../types';
import { Search, ChevronLeft, Save, ShieldCheck } from 'lucide-react';
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

  const isOwner = userSessionRole === 'SUPER_ADMIN';
  const isAdmin = userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'ADMIN';

  const activeAirmen = useMemo(() => nominalAirmen.filter(a => a.active), [nominalAirmen]);

  const mergedUsers = useMemo(() => {
    return activeAirmen.map((airman, index) => {
      const cleanBd = airman.bdNo.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
      const detailed = detailedUsers.find(d => d.bdNo.toLowerCase() === cleanBd);
      
      const role = detailed?.role || 'USER';
      const status = detailed?.status || 'ACTIVE';
      const isDefaultOwner = airman.bdNo === 'BD/116962';
      
      return {
        serNo: index + 1,
        cleanBd: airman.bdNo,
        airman,
        detailed,
        role: isDefaultOwner ? 'SUPER_ADMIN' : role,
        status,
        password: detailed?.password || '',
        adminPass: detailed?.adminPass || '',
        ownerPass: detailed?.ownerPass || '',
        isDefaultOwner
      };
    });
  }, [activeAirmen, detailedUsers]);

  const filteredUsers = useMemo(() => {
    return mergedUsers.filter(u => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (flightFilter !== 'ALL' && u.airman.flightName !== flightFilter) return false;
      
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      
      return (
        u.cleanBd.toLowerCase().includes(query) ||
        u.airman.name.toLowerCase().includes(query) ||
        u.airman.rank.toLowerCase().includes(query)
      );
    });
  }, [mergedUsers, searchQuery, roleFilter, flightFilter]);

  const [selectedUser, setSelectedUser] = useState<typeof mergedUsers[0] | null>(null);
  
  const [editRole, setEditRole] = useState<UserLoginRole>('USER');
  const [editStatus, setEditStatus] = useState<UserLoginStatus>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');

  const openProfile = (user: typeof mergedUsers[0]) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password);
    setEditAdminPass(user.adminPass);
  };

  const closeProfile = () => {
    setSelectedUser(null);
  };

  const saveProfile = () => {
    if (!selectedUser || !isAdmin) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const cleanBd = selectedUser.cleanBd.toLowerCase();
    const existingIdx = updatedDetailedUsers.findIndex(d => d.bdNo.toLowerCase() === cleanBd);
    
    const newDetail: DetailedUserLogin = {
      id: selectedUser.detailed?.id || `detail-${selectedUser.cleanBd}-${Date.now()}`,
      airmanId: selectedUser.airman.id,
      bdNo: selectedUser.cleanBd,
      rank: selectedUser.airman.rank,
      name: selectedUser.airman.name,
      flightName: selectedUser.airman.flightName || 'Admin',
      trade: selectedUser.airman.trade || 'General',
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
      ownerPass: selectedUser.ownerPass,
      detailedAt: selectedUser.detailed?.detailedAt || new Date().toISOString(),
      detailedBy: selectedUser.detailed?.detailedBy || 'System',
    };

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
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          {selectedUser ? (
            <button 
              onClick={closeProfile} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {selectedUser ? 'User Profile & Access' : 'User Management'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {selectedUser 
                ? `BD/${selectedUser.cleanBd} - ${selectedUser.airman.rank} ${selectedUser.airman.name}` 
                : 'Manage roles, passwords, and access for all nominal airmen'}
            </p>
          </div>
        </div>
      </div>

      {selectedUser ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start">
          <div className="max-w-xl w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditRole('USER')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border ${editRole === 'USER' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  User
                </button>
                <button
                  onClick={() => setEditRole('ADMIN')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border ${editRole === 'ADMIN' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  Admin
                </button>
                <button
                  disabled={!isOwner}
                  onClick={() => setEditRole('SUPER_ADMIN')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border ${editRole === 'SUPER_ADMIN' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'} ${!isOwner && 'opacity-50 cursor-not-allowed'}`}
                >
                  {selectedUser.isDefaultOwner ? 'System Owner' : 'Super Admin'}
                </button>
              </div>
            </div>

            {isOwner && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Login Password</label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-mono text-slate-900 dark:text-white"
                    placeholder="Login Pass"
                  />
                </div>
                
                {(editRole === 'ADMIN' || editRole === 'SUPER_ADMIN') && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Passcode <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={editAdminPass}
                      onChange={(e) => setEditAdminPass(e.target.value)}
                      className="w-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 font-mono text-slate-900 dark:text-white"
                      placeholder="Required for Admin"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
               <select
                 value={editStatus}
                 onChange={(e) => setEditStatus(e.target.value as UserLoginStatus)}
                 className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-sm font-bold text-slate-900 dark:text-white"
               >
                 <option value="ACTIVE">ACTIVE - Can log in</option>
                 <option value="SUSPENDED">SUSPENDED - Temporarily blocked</option>
                 <option value="REVOKED">REVOKED - Access permanently removed</option>
               </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeProfile}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by User ID, Rank, Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-200"
                />
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select 
                  value={flightFilter}
                  onChange={(e) => setFlightFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">All Flights</option>
                  <option value="Avionics">Avionics</option>
                  <option value="Mechanics">Mechanics</option>
                  <option value="GCS">GCS</option>
                  <option value="Admin">Admin</option>
                </select>
                <select 
                  value={roleFilter}
                  onChange={(e: any) => setRoleFilter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 relative custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Sl</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">User ID</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Rank & Name</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Role</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No active airmen found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.cleanBd}
                      onClick={() => { if (isAdmin) openProfile(user); }}
                      className={`transition-colors ${isAdmin ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-slate-500">{user.serNo}</td>
                      <td className="px-4 py-3 font-mono font-black text-slate-900 dark:text-white">
                        {user.cleanBd}
                        {user.isDefaultOwner && <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded text-[9px]">Sys Admin</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                        {user.airman.rank} {user.airman.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            user.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                            user.status === 'SUSPENDED' ? 'text-amber-600 dark:text-amber-400' :
                            'text-rose-600 dark:text-rose-400'
                          }`}>
                            {user.status}
                          </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
