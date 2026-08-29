import React, { useState, useEffect } from 'react';
import { Airman, DetailedUserLogin, UserLoginRole, UserLoginStatus, FlightName } from '../types';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Trash2,
  Sparkles,
  Edit2,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  getDetailedUsers,
  saveDetailedUsers,
  detailAirmanForLogin,
  removeDetailedUser,
  toggleUserLoginStatus,
  batchDetailAllAirmen
} from '../utils/authSession';

interface UserLoginDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nominalAirmen: Airman[];
  selectedAirmanForDetail?: Airman | null;
  onUserDetailed?: () => void;
}

export const UserLoginDetailModal: React.FC<UserLoginDetailModalProps> = ({
  isOpen,
  onClose,
  nominalAirmen,
  selectedAirmanForDetail,
  onUserDetailed,
}) => {
  const [detailedUsers, setDetailedUsers] = useState<DetailedUserLogin[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form states
  const [selectedAirmanId, setSelectedAirmanId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserLoginRole>('USER');
  const [selectedStatus, setSelectedStatus] = useState<UserLoginStatus>('ACTIVE');
  const [detailOrder, setDetailOrder] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  const refreshList = () => {
    const list = getDetailedUsers(nominalAirmen);
    setDetailedUsers(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      if (selectedAirmanForDetail) {
        setSelectedAirmanId(selectedAirmanForDetail.id);
        const cleanBd = selectedAirmanForDetail.bdNo.replace(/^BD\/?/i, '').trim();
        setDetailOrder(`DO-155/DTL/${cleanBd}`);
        setRemarks(`Detailed for User Login (${selectedAirmanForDetail.flightName} Flight)`);
        setSelectedRole(cleanBd === '474455' ? 'ADMIN' : 'USER');
      } else {
        setSelectedAirmanId(nominalAirmen[0]?.id || '');
        setDetailOrder('DO-155/GEN/2026');
        setRemarks('Authorized 155 UASU Login Access');
      }
    }
  }, [isOpen, selectedAirmanForDetail, nominalAirmen]);

  if (!isOpen) return null;

  const handleAirmanSelectionChange = (airmanId: string) => {
    setSelectedAirmanId(airmanId);
    const airman = nominalAirmen.find((a) => a.id === airmanId);
    if (airman) {
      const cleanBd = airman.bdNo.replace(/^BD\/?/i, '').trim();
      setDetailOrder(`DO-155/DTL/${cleanBd}`);
      setRemarks(`Authorized User Login (${airman.flightName} Flight)`);
      if (cleanBd === '474455') {
        setSelectedRole('ADMIN');
      }
    }
  };

  const handleSaveDetail = (e: React.FormEvent) => {
    e.preventDefault();
    const airman = nominalAirmen.find((a) => a.id === selectedAirmanId);
    if (!airman) return;

    detailAirmanForLogin(airman, selectedRole, selectedStatus, detailOrder, remarks);
    refreshList();
    setSuccessNotice(`Successfully detailed BD/${airman.bdNo.replace(/^BD\/?/i, '')} (${airman.rank} ${airman.name}) for Login.`);
    setTimeout(() => setSuccessNotice(''), 4000);
    if (onUserDetailed) onUserDetailed();
  };

  const handleBatchDetailAll = () => {
    batchDetailAllAirmen(nominalAirmen);
    refreshList();
    setSuccessNotice(`Successfully detailed all ${nominalAirmen.length} Airmen from Nominal Roll for User Login.`);
    setTimeout(() => setSuccessNotice(''), 4500);
    if (onUserDetailed) onUserDetailed();
  };

  const handleStatusChange = (bdNo: string, newStatus: UserLoginStatus) => {
    toggleUserLoginStatus(bdNo, newStatus);
    refreshList();
    if (onUserDetailed) onUserDetailed();
  };

  const handleRemove = (bdNo: string, name: string) => {
    if (bdNo === '474455') {
      alert('Primary Admin User ID (474455) cannot be deleted.');
      return;
    }
    removeDetailedUser(bdNo);
    refreshList();
    setSuccessNotice(`Removed login detail for BD/${bdNo} (${name}).`);
    setTimeout(() => setSuccessNotice(''), 3000);
    if (onUserDetailed) onUserDetailed();
  };

  // Filtered detailed users
  const filteredUsers = detailedUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.bdNo.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.rank.toLowerCase().includes(q) ||
      u.trade.toLowerCase().includes(q) ||
      (u.flightName && u.flightName.toLowerCase().includes(q));

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  User Login Access & Detail Management
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {detailedUsers.length} Users Detailed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detail personnel from the Nominal Roll for system user login & role authorization.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Primary ID Card Banner */}
          <div className="bg-linear-to-r from-emerald-900/40 via-slate-900 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Default 1st Login ID
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    Primary Admin
                  </span>
                </div>
                <p className="text-sm font-black mt-0.5">
                  BD/474455 • LAC Rasel (Avionics Flight)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBatchDetailAll}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              title="Detail all 48 Nominal Roll Airmen for login access at once"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Detail All From Nominal Roll</span>
            </button>
          </div>

          {/* Form: Detail a User */}
          <form
            onSubmit={handleSaveDetail}
            className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4"
          >
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 dark:text-slate-200">
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Detail or Update Airman Login Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Select Airman */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Select Airman from Nominal Roll *
                </label>
                <select
                  value={selectedAirmanId}
                  onChange={(e) => handleAirmanSelectionChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {nominalAirmen.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bdNo} • {a.rank} {a.name} ({a.flightName} - {a.trade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  System Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserLoginRole)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="USER">Standard User</option>
                  <option value="DUTY_NCO">Duty NCO / Scribe</option>
                  <option value="FLIGHT_IC">Flight In-Charge</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Access Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as UserLoginStatus)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ACTIVE">Active (Allowed)</option>
                  <option value="SUSPENDED">Suspended (Temporary)</option>
                  <option value="DISABLED">Disabled (Blocked)</option>
                </select>
              </div>

              {/* Detail Order */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Detail Order Ref
                </label>
                <input
                  type="text"
                  value={detailOrder}
                  onChange={(e) => setDetailOrder(e.target.value)}
                  placeholder="e.g. DO-155/DTL/474455"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-medium outline-none focus:border-emerald-500"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Remarks / Duty Assignment
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Detailed for Operations & Duty Roster Management"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Save User Detail</span>
                </button>
              </div>
            </div>
          </form>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search detailed BD, name, trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DUTY_NCO">Duty NCO</option>
                <option value="FLIGHT_IC">Flight I/C</option>
                <option value="USER">User</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          {/* Table of Detailed Users */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/90 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">BD / User ID</th>
                    <th className="py-2.5 px-3">Airman</th>
                    <th className="py-2.5 px-3">Flight & Trade</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Order / Remarks</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No detailed user logins found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isPrimary = user.bdNo === '474455';
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono font-black text-slate-900 dark:text-white">
                            <div className="flex items-center space-x-1.5">
                              <span>BD/{user.bdNo}</span>
                              {isPrimary && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                  Primary
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {user.rank} {user.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {user.flightName}
                            </span>{' '}
                            • {user.trade}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : user.role === 'DUTY_NCO'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : user.role === 'FLIGHT_IC'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                const nextStatus: UserLoginStatus =
                                  user.status === 'ACTIVE'
                                    ? 'SUSPENDED'
                                    : user.status === 'SUSPENDED'
                                    ? 'DISABLED'
                                    : 'ACTIVE';
                                handleStatusChange(user.bdNo, nextStatus);
                              }}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                                user.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
                                  : user.status === 'SUSPENDED'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 hover:bg-amber-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-200'
                              }`}
                              title="Click to toggle status: Active -> Suspended -> Disabled"
                            >
                              {user.status}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            <div>{user.detailOrder || 'DO-155'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-40">
                              {user.remarks}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedAirmanId(user.airmanId || '');
                                  setSelectedRole(user.role);
                                  setSelectedStatus(user.status);
                                  setDetailOrder(user.detailOrder || `DO-155/DTL/${user.bdNo}`);
                                  setRemarks(user.remarks || '');
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors"
                                title="Edit Detail"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {!isPrimary && (
                                <button
                                  onClick={() => handleRemove(user.bdNo, user.name)}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Revoke / Delete Login Access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Changes take effect immediately on device authorization gate.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
