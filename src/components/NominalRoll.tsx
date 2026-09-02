import React, { useState } from 'react';
import { Airman, FlightName, Rank, UserRole } from '../types';
import { Search, UserPlus, Edit3, Trash2, Eye, Filter, Phone, MapPin, Shield, CheckCircle, RefreshCw, Printer, FileDown, FileSpreadsheet, Upload, KeyRound, UserCheck } from 'lucide-react';
import { sortAirmenBySeniority } from '../utils/seniority';
import { exportNominalRollDocx } from '../utils/docxExport';
import { BulkImportAirmenModal } from './BulkImportAirmenModal';
import { EntryHistoryModal } from './EntryHistoryModal';
import { History } from 'lucide-react';

interface NominalRollProps {
  airmen: Airman[];
  role: UserRole;
  onRefresh: () => void;
  onAddAirman: () => void;
  onEditAirman: (airman: Airman) => void;
  onDeleteAirman: (airmanId: string) => void;
  onViewProfile: (airman: Airman) => void;
  onSyncGoogleSheet?: () => Promise<void>;
}

export const NominalRoll: React.FC<NominalRollProps> = ({
  airmen,
  role,
  onRefresh,
  onAddAirman,
  onEditAirman,
  onDeleteAirman,
  onViewProfile,
  onSyncGoogleSheet,
}) => {
  const [search, setSearch] = useState('');
  const [flightFilter, setFlightFilter] = useState<FlightName | 'All' | ''>('All');
  const [rankFilter, setRankFilter] = useState<Rank | 'All' | ''>('All');
  const [statusFilter, setStatusFilter] = useState<'Total' | 'Active' | 'Previous Airmen'>('Active');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  

  const [airmanToDelete, setAirmanToDelete] = useState<Airman | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSync = async () => {
    if (!onSyncGoogleSheet) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      await onSyncGoogleSheet();
      setSyncStatus('Synced successfully from Google Sheet!');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      setSyncStatus('Sync failed. Please check internet connection.');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const flightsList: (FlightName | 'All')[] = [
    'All',
    'Avionics',
    'Mechanics',
    'GCS',
    'Admin',
  ];

  const ranksList: (Rank | 'All')[] = ['All', 'MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];

  // Sort airmen strictly by BAF Seniority
  const sortedAirmen = sortAirmenBySeniority(airmen);

  // Filter airmen
  const filteredAirmen = sortedAirmen.filter((airman) => {
    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = airman.active !== false;
    } else if (statusFilter === 'Previous Airmen') {
      matchesStatus = airman.active === false;
    }
    
    const matchesFlight = flightFilter === '' ? true : (flightFilter === 'All' || airman.flightName === flightFilter);
    const matchesRank = rankFilter === '' ? true : (rankFilter === 'All' || airman.rank === rankFilter);
    const q = search.toLowerCase();
    const matchesSearch =
      airman.name.toLowerCase().includes(q) ||
      airman.bdNo.toLowerCase().includes(q) ||
      airman.code.toLowerCase().includes(q) ||
      airman.trade.toLowerCase().includes(q) ||
      airman.addressBlock.toLowerCase().includes(q);

    return matchesStatus && matchesFlight && matchesRank && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>Nominal Roll Directory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300">
              {filteredAirmen.length} Airmen (Seniority Order)
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete Airmen list for 155 UASU BAF • Sorted by Rank Seniority & BD Number.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          

          <button
            onClick={() => exportNominalRollDocx(filteredAirmen)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Download Nominal Roll as Document"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Document</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            title="Print or Save Nominal Roll as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold text-xs shadow-xs transition-colors"
            title="View Activity History"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>History</span>
          </button>

          {(role === 'ADMIN' || role === 'SUPER_ADMIN') ? (
            <button
              onClick={onAddAirman}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Airman</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
              <Eye className="w-3.5 h-3.5" />
              <span>Read-Only Directory</span>
            </div>
          )}
        </div>
      </div>

      {syncStatus && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <span className="font-semibold">{syncStatus}</span>
          <span className="font-mono text-[10px] text-emerald-400 opacity-80">155 UASU BAF Sheet Connected</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name, BD No, Trade, Flight..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Flight Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Flight:</span>
            <select
              value={flightFilter}
              onChange={(e) => setFlightFilter(e.target.value as any)}
              className="bg-transparent font-black outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="All">All Flights</option>
              {flightsList.map((fl) => (
                <option key={fl} value={fl} className="bg-white dark:bg-slate-900">
                  {fl === 'All' ? 'All Flights (48)' : `${fl} Flight`}
                </option>
              ))}
            </select>
          </div>

          {/* Rank Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Rank:</span>
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value as any)}
              className="bg-transparent font-black outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="All">All Ranks</option>
              {ranksList.map((rk) => (
                <option key={rk} value={rk} className="bg-white dark:bg-slate-900">
                  {rk === 'All' ? 'All Ranks' : rk}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-black outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="Total">Total</option>
              <option value="Active">Active</option>
              <option value="Previous Airmen">Previous Airmen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 w-12 text-center">Ser</th>
                <th className="py-3 px-4">BD No</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Name (Click for History)</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Quarter / Block</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredAirmen.map((airman, idx) => (
                <tr
                  key={airman.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-400 text-center">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-slate-100">
                    {airman.bdNo}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-black px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono border border-slate-300 dark:border-slate-700">
                      {airman.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onViewProfile(airman)}
                      className="font-black text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left flex items-center space-x-1"
                      title="Click to view duty & leave history"
                    >
                      <span>{airman.name}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {airman.trade}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {airman.flightName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{airman.addressBlock}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{airman.mobileNo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${airman.active !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'}`}>
                      {airman.active !== false ? 'Active' : (airman.leaveReason || 'Inactive')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onViewProfile(airman)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                        title="View Full History & Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                        <>
                          

                          <button
                            onClick={() => onEditAirman(airman)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit Airman Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setAirmanToDelete(airman)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Airman"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom In-App Delete Airman Confirmation Modal */}
      {airmanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Remove Airman Record?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action removes the personnel from the active nominal roll.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">BD Number:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">{airmanToDelete.bdNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rank & Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{airmanToDelete.rank} {airmanToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flight & Trade:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{airmanToDelete.flightName} Flight • {airmanToDelete.trade}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setAirmanToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await onDeleteAirman(airmanToDelete.id);
                    setAirmanToDelete(null);
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md shadow-rose-900/20 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Airmen Modal */}
      <BulkImportAirmenModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        existingAirmen={airmen}
        onImportComplete={() => {
          onRefresh();
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
        }}
      />

      

      {isHistoryModalOpen && (
        <EntryHistoryModal
          airmen={airmen}
          filterType="ALL"
          onClose={() => setIsHistoryModalOpen(false)}
          onRefreshData={onRefresh}
        />
      )}
    </div>
  );
};
