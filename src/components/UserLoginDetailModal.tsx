
import React, { useState, useMemo } from 'react';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus } from '../types';
import { X, Search, Edit2, ShieldCheck, UserCheck, KeyRound, Save } from 'lucide-react';
import { getDetailedUsers, saveDetailedUsers } from '../utils/authSession';

interface UserLoginDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nominalAirmen: Airman[];
  userSessionRole?: string;
}

export const UserLoginDetailModal: React.FC<UserLoginDetailModalProps> = ({
  isOpen,
  onClose,
  nominalAirmen,
  userSessionRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [detailedUsers, setDetailedUsers] = useState<DetailedUserLogin[]>(() => getDetailedUsers(nominalAirmen));
  const [editingBd, setEditingBd] = useState<string | null>(null);

  // Form states for the currently edited row
  const [editRole, setEditRole] = useState<UserLoginRole>('USER');
  const [editStatus, setEditStatus] = useState<UserLoginStatus>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');
  const [editOwnerPass, setEditOwnerPass] = useState('');

  const isOwner = userSessionRole === 'SUPER_ADMIN';

  const mergedUsers = useMemo(() => {
    return nominalAirmen.map((airman, index) => {
      const cleanBd = airman.bdNo.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
      const detailed = detailedUsers.find(d => d.bdNo.toLowerCase() === cleanBd);
      
      const isDefaultOwner = cleanBd === '474455';
      const role = detailed ? detailed.role : (isDefaultOwner ? 'SUPER_ADMIN' : 'USER');
      const status = detailed ? detailed.status : 'ACTIVE';
      const password = detailed?.password || cleanBd;
      const adminPass = detailed?.adminPass || (isDefaultOwner ? '1124' : '');
      const ownerPass = detailed?.ownerPass || '';
      
      return {
        airman,
        cleanBd,
        serNo: index + 1,
        role,
        status,
        password,
        adminPass,
        ownerPass,
        detailed,
        isDefaultOwner
      };
    });
  }, [nominalAirmen, detailedUsers]);

  const filteredUsers = mergedUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.cleanBd.includes(query) ||
      u.airman.name.toLowerCase().includes(query) ||
      u.airman.rank.toLowerCase().includes(query)
    );
  });

  const startEdit = (user: typeof mergedUsers[0]) => {
    setEditingBd(user.cleanBd);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password);
    setEditAdminPass(user.adminPass);
    setEditOwnerPass(user.ownerPass);
  };

  const cancelEdit = () => {
    setEditingBd(null);
  };

  const saveEdit = (user: typeof mergedUsers[0]) => {
    const updatedDetailedUsers = [...detailedUsers];
    const existingIdx = updatedDetailedUsers.findIndex(d => d.bdNo.toLowerCase() === user.cleanBd);
    
    const newDetail: DetailedUserLogin = {
      id: user.detailed?.id || `detail-${user.cleanBd}-${Date.now()}`,
      airmanId: user.airman.id,
      bdNo: user.cleanBd,
      rank: user.airman.rank,
      name: user.airman.name,
      flightName: user.airman.flightName || 'Admin',
      trade: user.airman.trade || 'General',
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
      ownerPass: editOwnerPass,
      detailedAt: user.detailed?.detailedAt || new Date().toISOString(),
      detailedBy: user.detailed?.detailedBy || 'System',
    };

    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    setEditingBd(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">User Management</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Manage roles, passwords, and access for all nominal airmen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by BD No, Rank, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            {/* Role Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${roleFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                All
              </button>
              <button 
                onClick={() => setRoleFilter('USER')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${roleFilter === 'USER' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Normal User
              </button>
              <button 
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${roleFilter === 'ADMIN' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Admin
              </button>
              <button 
                onClick={() => setRoleFilter('SUPER_ADMIN')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${roleFilter === 'SUPER_ADMIN' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full xl:w-auto justify-between xl:justify-end">
            <button 
              onClick={() => setRoleFilter('USER')}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl transition-colors text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              <span>Add Admin (from Normal)</span>
            </button>
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span className="hidden sm:inline">Super Admin mode is {isOwner ? 'Active' : 'Required'}</span>
               <span className="sm:hidden">{isOwner ? 'Super Admin' : 'Read-only'}</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-slate-50/30 dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Ser No</th>
                <th className="px-4 py-3 whitespace-nowrap">BD No</th>
                <th className="px-4 py-3 min-w-[150px]">Rank & Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                {isOwner && (
                  <>
                    <th className="px-4 py-3 whitespace-nowrap">Login Pass</th>
                    <th className="px-4 py-3 whitespace-nowrap">Admin Pass</th>
                    
                  </>
                )}
                <th className="px-4 py-3 text-right sticky right-0 bg-slate-100 dark:bg-slate-800/80 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isOwner ? 7 : 5} className="py-12 text-center text-slate-500">
                    No airmen found in nominal roll matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isEditing = editingBd === user.cleanBd;

                  return (
                    <tr 
                      key={user.cleanBd}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isEditing ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                    >
                      <td className="px-4 py-2 font-mono text-slate-500">{user.serNo}</td>
                      <td className="px-4 py-2 font-mono font-black text-slate-900 dark:text-white">
                        BD/{user.cleanBd}
                        {user.isDefaultOwner && <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded text-[9px]">Sys Admin</span>}
                      </td>
                      <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">
                        {user.airman.rank} {user.airman.name}
                      </td>
                      
                      {/* ROLE */}
                      <td className="px-4 py-2">
                        {isEditing && isOwner ? (
                          <select 
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserLoginRole)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:border-emerald-500 w-full font-bold text-slate-700 dark:text-slate-200"
                          >
                            <option value="USER">Normal User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                            user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'Normal User'}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-2 text-center">
                         {isEditing && isOwner ? (
                            <select 
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as UserLoginStatus)}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:border-emerald-500 font-bold text-slate-700 dark:text-slate-200"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="SUSPENDED">Suspended</option>
                              <option value="DISABLED">Disabled</option>
                            </select>
                         ) : (
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            user.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                            user.status === 'SUSPENDED' ? 'text-amber-600 dark:text-amber-400' :
                            'text-rose-600 dark:text-rose-400'
                           }`}>
                             {user.status}
                           </span>
                         )}
                      </td>

                      {/* PASSWORDS (OWNER ONLY) */}
                      {isOwner && (
                        <>
                          <td className="px-4 py-2 font-mono">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="w-20 sm:w-24 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:border-emerald-500"
                                placeholder="Login Pass"
                              />
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{user.password}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editAdminPass}
                                onChange={(e) => setEditAdminPass(e.target.value)}
                                className="w-16 sm:w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none focus:border-amber-500"
                                placeholder="Admin"
                              />
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{user.role === 'USER' ? '' : (user.adminPass || '')}</span>
                            )}
                          </td>
                          
                        </>
                      )}

                      {/* ACTIONS */}
                      <td className="px-4 py-2 text-right sticky right-0 bg-white dark:bg-slate-900 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                         {isEditing ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={cancelEdit}
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => saveEdit(user)}
                                className="flex items-center space-x-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                         ) : (
                            <button
                              onClick={() => isOwner ? startEdit(user) : alert("Owner access required to edit users.")}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isOwner ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
                              title={isOwner ? "Edit User Access" : "Super Admin Only"}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                         )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
