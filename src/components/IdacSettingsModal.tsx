import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  CheckSquare,
  Square,
  ShieldCheck,
  Phone,
  Filter,
  Clock,
  RotateCcw,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import {
  IdacResponsibility,
  IdacEmergencyContact,
  IdacShiftTimeConfig,
  getIdacResponsibilities,
  saveIdacResponsibilities,
  getIdacEmergencyContacts,
  saveIdacEmergencyContacts,
  getIdacShiftTimes,
  saveIdacShiftTimes,
  DEFAULT_SHIFT_TIMES,
  getRankSeniorityWeight,
  sortContactsBySeniority,
} from '../data/idacSettings';
import { Airman, FlightName } from '../types';

interface IdacSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  airmen?: Airman[];
}

export const IdacSettingsModal: React.FC<IdacSettingsModalProps> = ({
  isOpen,
  onClose,
  airmen = [],
}) => {
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'SHIFT_TIMES' | 'RESPONSIBILITIES' | null>('CONTACTS');

  // Shift Times state
  const [shiftTimes, setShiftTimes] = useState<IdacShiftTimeConfig[]>(DEFAULT_SHIFT_TIMES);

  // Responsibilities state
  const [responsibilities, setResponsibilities] = useState<IdacResponsibility[]>([]);
  const [newRespText, setNewRespText] = useState<string>('');
  const [editingRespId, setEditingRespId] = useState<string | null>(null);
  const [editingRespText, setEditingRespText] = useState<string>('');

  // Contacts state
  const [contacts, setContacts] = useState<IdacEmergencyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flightFilter, setFlightFilter] = useState<'ALL' | FlightName>('ALL');

  // Manual Contact Add/Edit
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactRank, setNewContactRank] = useState<string>('');
  const [newContactRemark, setNewContactRemark] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactWhatsapp, setNewContactWhatsapp] = useState<string>('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactData, setEditContactData] = useState<Partial<IdacEmergencyContact>>({});

  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setShiftTimes(getIdacShiftTimes());
      setResponsibilities(getIdacResponsibilities());
      setContacts(getIdacEmergencyContacts());
      setNewRespText('');
      setEditingRespId(null);
      setEditingContactId(null);
      setToastMsg('');
      setSearchQuery('');
      setFlightFilter('ALL');
      setShowManualForm(false);
      setNewContactRemark('');
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Shift Times Handlers
  const handleShiftTimeChange = (
    shift: 'Morning' | 'Afternoon' | 'Night',
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = shiftTimes.map((st) => {
      if (st.shift === shift) {
        const newObj = { ...st, [field]: value };
        newObj.label = `${newObj.startTime} - ${newObj.endTime} hrs`;
        return newObj;
      }
      return st;
    });
    setShiftTimes(updated);
    saveIdacShiftTimes(updated);
    showToast(`${shift} shift time updated.`);
  };

  const handleResetShiftTimes = () => {
    setShiftTimes(DEFAULT_SHIFT_TIMES);
    saveIdacShiftTimes(DEFAULT_SHIFT_TIMES);
    showToast('Shift times reset to default.');
  };

  // Responsibilities Handlers
  const handleAddResponsibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRespText.trim()) return;
    const newItem: IdacResponsibility = {
      id: Date.now().toString(),
      text: newRespText.trim(),
    };
    const updated = [...responsibilities, newItem];
    setResponsibilities(updated);
    saveIdacResponsibilities(updated);
    setNewRespText('');
    showToast('Responsibility item added.');
  };

  const handleDeleteResponsibility = (id: string) => {
    const updated = responsibilities.filter((r) => r.id !== id);
    setResponsibilities(updated);
    saveIdacResponsibilities(updated);
    showToast('Responsibility removed.');
  };

  const handleSaveEditResponsibility = (id: string) => {
    if (!editingRespText.trim()) return;
    const updated = responsibilities.map((r) =>
      r.id === id ? { ...r, text: editingRespText.trim() } : r
    );
    setResponsibilities(updated);
    saveIdacResponsibilities(updated);
    setEditingRespId(null);
    showToast('Responsibility updated.');
  };

  // Sort airmen strictly by Seniority (Rank Weight -> SerNo)
  const sortedAirmenBySeniority = useMemo(() => {
    return [...airmen].sort((a, b) => {
      const rA = getRankSeniorityWeight(a.rank);
      const rB = getRankSeniorityWeight(b.rank);
      if (rA !== rB) return rA - rB;
      const serA = typeof a.serNo === 'number' && a.serNo > 0 ? a.serNo : 999;
      const serB = typeof b.serNo === 'number' && b.serNo > 0 ? b.serNo : 999;
      return serA - serB;
    });
  }, [airmen]);

  // Check if an airman is currently in emergency contacts
  const isAirmanSelected = (airman: Airman): boolean => {
    const cleanAirmanPhone = (airman.mobileNo || '').replace(/\D/g, '');
    const cleanAirmanName = airman.name.toLowerCase().replace(/[^a-z]/g, '');
    const isBaten = cleanAirmanName.includes('baten');

    return contacts.some((c) => {
      if (c.airmanId && c.airmanId === airman.id) return true;
      if (c.id === airman.id) return true;
      const cleanCPhone = (c.phone || '').replace(/\D/g, '');
      if (cleanAirmanPhone && cleanCPhone && cleanAirmanPhone.slice(-8) === cleanCPhone.slice(-8)) return true;
      const cleanCName = (c.name || '').toLowerCase().replace(/[^a-z]/g, '');
      if (isBaten && cleanCName.includes('baten')) return true;
      if (cleanAirmanName.length >= 4 && cleanCName.includes(cleanAirmanName)) return true;
      return false;
    });
  };

  // Toggle selection for a single airman (Select / Deselect)
  const handleToggleAirman = (airman: Airman) => {
    const alreadySelected = isAirmanSelected(airman);
    let updated: IdacEmergencyContact[];

    const cleanAirmanPhone = (airman.mobileNo || '').replace(/\D/g, '');
    const cleanAirmanName = airman.name.toLowerCase().replace(/[^a-z]/g, '');
    const isBaten = cleanAirmanName.includes('baten');

    if (alreadySelected) {
      // Deselect / Remove
      updated = contacts.filter((c) => {
        if (c.airmanId === airman.id || c.id === airman.id) return false;
        const cleanCPhone = (c.phone || '').replace(/\D/g, '');
        if (cleanAirmanPhone && cleanCPhone && cleanAirmanPhone.slice(-8) === cleanCPhone.slice(-8)) return false;
        const cleanCName = (c.name || '').toLowerCase().replace(/[^a-z]/g, '');
        if (isBaten && cleanCName.includes('baten')) return false;
        return true;
      });
      showToast(`Removed ${airman.rank} ${airman.name} from Emergency Contacts.`);
    } else {
      // Select / Add
      const phone = airman.mobileNo?.trim() || '01XXXXXXXXX';
      const isBatenAirman = airman.name.toLowerCase().includes('baten');
      const newContact: IdacEmergencyContact = {
        id: airman.id || Date.now().toString(),
        airmanId: airman.id,
        name: `${airman.rank} ${airman.name}`,
        remark: isBatenAirman ? 'Supervisor' : undefined,
        rankDesignation: `${airman.rank} (${airman.flightName} Flt)`,
        phone: phone,
        whatsappPhone: phone,
        rank: airman.rank,
        flightName: airman.flightName,
        serNo: airman.serNo,
      };
      updated = sortContactsBySeniority([...contacts, newContact]);
      showToast(`Added ${airman.rank} ${airman.name} to Emergency Contacts.`);
    }

    setContacts(updated);
    saveIdacEmergencyContacts(updated);
  };

  // Filtered airmen based on search and flight
  const filteredAirmen = useMemo(() => {
    return sortedAirmenBySeniority.filter((a) => {
      if (flightFilter !== 'ALL' && a.flightName !== flightFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q) ||
        a.bdNo.toLowerCase().includes(q) ||
        a.flightName.toLowerCase().includes(q) ||
        (a.mobileNo && a.mobileNo.includes(q))
      );
    });
  }, [sortedAirmenBySeniority, flightFilter, searchQuery]);

  // Select all visible filtered airmen
  const handleSelectAllVisible = () => {
    const newItems: IdacEmergencyContact[] = [];
    filteredAirmen.forEach((a) => {
      if (!isAirmanSelected(a)) {
        const phone = a.mobileNo?.trim() || '01XXXXXXXXX';
        const isBatenAirman = a.name.toLowerCase().includes('baten');
        newItems.push({
          id: a.id || Date.now().toString() + Math.random(),
          airmanId: a.id,
          name: `${a.rank} ${a.name}`,
          remark: isBatenAirman ? 'Supervisor' : undefined,
          rankDesignation: `${a.rank} (${a.flightName} Flt)`,
          phone: phone,
          whatsappPhone: phone,
          rank: a.rank,
          flightName: a.flightName,
          serNo: a.serNo,
        });
      }
    });

    if (newItems.length === 0) return;
    const updated = sortContactsBySeniority([...contacts, ...newItems]);
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    showToast(`Selected all ${filteredAirmen.length} personnel.`);
  };

  // Deselect all visible filtered airmen
  const handleDeselectAllVisible = () => {
    const visibleIds = new Set(filteredAirmen.map((a) => a.id));
    const visiblePhones = new Set(filteredAirmen.map((a) => a.mobileNo?.replace(/\D/g, '')).filter(Boolean));

    const updated = contacts.filter((c) => {
      if (c.airmanId && visibleIds.has(c.airmanId)) return false;
      if (visibleIds.has(c.id)) return false;
      const cleanP = c.phone.replace(/\D/g, '');
      if (cleanP && visiblePhones.has(cleanP)) return false;
      return true;
    });

    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    showToast(`Deselected visible personnel.`);
  };

  // Manual Contact Add
  const handleAddManualContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      alert('Please provide at least Name and Phone.');
      return;
    }
    const cleanPhone = newContactPhone.trim();
    const cleanWhatsapp = newContactWhatsapp.trim() || cleanPhone;
    const newContact: IdacEmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      remark: newContactRemark.trim() || undefined,
      rankDesignation: newContactRank.trim() || 'Officer / Airman',
      phone: cleanPhone,
      whatsappPhone: cleanWhatsapp,
      rank: newContactRank.trim(),
      serNo: 999,
    };
    const updated = sortContactsBySeniority([...contacts, newContact]);
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    setNewContactName('');
    setNewContactRank('');
    setNewContactRemark('');
    setNewContactPhone('');
    setNewContactWhatsapp('');
    setShowManualForm(false);
    showToast('Custom contact added.');
  };

  // Delete directly from contacts
  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    showToast('Contact removed.');
  };

  // Save edited contact
  const handleSaveEditContact = (id: string) => {
    if (!editContactData.name || !editContactData.phone) return;
    const updated = contacts.map((c) =>
      c.id === id
        ? {
            ...c,
            name: editContactData.name!,
            remark: editContactData.remark?.trim() || undefined,
            rankDesignation: editContactData.rankDesignation || c.rankDesignation,
            phone: editContactData.phone!,
            whatsappPhone: editContactData.whatsappPhone || editContactData.phone!,
          }
        : c
    );
    const sorted = sortContactsBySeniority(updated);
    setContacts(sorted);
    saveIdacEmergencyContacts(sorted);
    setEditingContactId(null);
    showToast('Contact updated.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                IDA Center Settings & Contacts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Seniority-Ordered Emergency Contacts & Duty Responsibilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Banner */}
        {toastMsg && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[62vh] overflow-y-auto space-y-3">
          
          {/* Section 1: Emergency Contacts */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'CONTACTS'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'CONTACTS' ? null : 'CONTACTS')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'CONTACTS' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Emergency Contacts</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {contacts.length} Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Manage personnel shown in Emergency Contacts list</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'CONTACTS' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'CONTACTS' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">
              

              {/* Search & Flight Filters & Select/Deselect Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, rank, BD no, or phone..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Flight Filter */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
                  {(['ALL', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as const).map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setFlightFilter(fl)}
                      className={`px-2 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                        flightFilter === fl
                          ? 'bg-emerald-600 text-white shadow-2xs font-black'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Select All / Deselect All Buttons */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                  Showing {filteredAirmen.length} Personnel (Sorted by Seniority)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Select All Filtered</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllVisible}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Square className="w-3 h-3" />
                    <span>Deselect Filtered</span>
                  </button>
                </div>
              </div>

              {/* Personnel Select / Deselect List (Seniority Ordered) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {filteredAirmen.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No matching personnel found.
                  </div>
                ) : (
                  filteredAirmen.map((airman) => {
                    const isSelected = isAirmanSelected(airman);
                    return (
                      <div
                        key={airman.id}
                        onClick={() => handleToggleAirman(airman)}
                        className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Checkbox Icon */}
                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500" />
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                                #{airman.serNo || '-'}
                              </span>
                              <span className={`font-black ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-900 dark:text-slate-100'}`}>
                                {airman.rank} {airman.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                {airman.flightName} Flt
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {airman.trade}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2">
                              <span>📞 {airman.mobileNo || 'No phone registered'}</span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span>BD/{airman.bdNo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                              Selected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold">
                              Click to Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Contacts Summary & Management */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Active Emergency Contacts ({contacts.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showManualForm ? 'Hide Custom Contact' : 'Add Custom Outside Contact'}</span>
                  </button>
                </div>

                {/* Optional Custom/Manual Add Form */}
                {showManualForm && (
                  <form onSubmit={handleAddManualContact} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5 animate-fadeIn">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Add Custom / External Contact (e.g. Medical / Fire / Duty Officer)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="Contact Name (e.g. WO A Baten)"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newContactRemark}
                        onChange={(e) => setNewContactRemark(e.target.value)}
                        placeholder="Remarks (e.g. Supervisor)"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={newContactRank}
                        onChange={(e) => setNewContactRank(e.target.value)}
                        placeholder="Rank / Designation (optional)"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="Phone Number (e.g. 017XXXXXXXX)"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newContactWhatsapp}
                        onChange={(e) => setNewContactWhatsapp(e.target.value)}
                        placeholder="WhatsApp (optional)"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom Contact</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Selected Active Contacts list */}
                <div className="space-y-1.5">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between text-xs"
                    >
                      {editingContactId === c.id ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editContactData.name || ''}
                              onChange={(e) => setEditContactData({ ...editContactData, name: e.target.value })}
                              placeholder="Name"
                              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={editContactData.remark || ''}
                              onChange={(e) => setEditContactData({ ...editContactData, remark: e.target.value })}
                              placeholder="Remarks (e.g. Supervisor)"
                              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-amber-400 dark:border-amber-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={editContactData.phone || ''}
                              onChange={(e) => setEditContactData({ ...editContactData, phone: e.target.value })}
                              placeholder="Phone"
                              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEditContact(c.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingContactId(null)}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                                <span>{c.name}</span>
                                {c.remark?.trim() ? (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                                    ({c.remark.trim()})
                                  </span>
                                ) : null}
                              </div>
                              <div className="font-mono text-slate-500 dark:text-slate-400 font-semibold text-[11px] mt-0.5">
                                📞 {c.phone}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContactId(c.id);
                                setEditContactData({ ...c });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                              title="Remove Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            </div>
            )}
          </div>

          {/* Section 2: Shift Time Management */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'SHIFT_TIMES'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'SHIFT_TIMES' ? null : 'SHIFT_TIMES')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'SHIFT_TIMES' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Shift Time Management</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Configure start and end times for all 3 shifts</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'SHIFT_TIMES' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'SHIFT_TIMES' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>IDAC 24/7 Shift Time Management</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Configure official start and end times for Morning, Afternoon, and Night shifts. Changes dynamically update live duty status and schedule timings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetShiftTimes}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs ml-3"
                  title="Reset to default (07:30-14:30, 14:30-21:00, 21:00-07:30)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Shift Timing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {shiftTimes.map((st) => {
                  const isMorning = st.shift === 'Morning';
                  const isAfternoon = st.shift === 'Afternoon';
                  const isNight = st.shift === 'Night';

                  const cardStyle = isMorning
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isAfternoon
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20';

                  const badgeStyle = isMorning
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : isAfternoon
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';

                  return (
                    <div
                      key={st.shift}
                      className={`p-4 rounded-2xl border ${cardStyle} space-y-3.5 shadow-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${badgeStyle}`}>
                          {st.shift} Shift
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          {st.startTime} - {st.endTime}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={st.startTime}
                            onChange={(e) => handleShiftTimeChange(st.shift, 'startTime', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={st.endTime}
                            onChange={(e) => handleShiftTimeChange(st.shift, 'endTime', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] text-slate-400 font-medium">
                        {isNight ? 'Spans overnight across 00:00 AM' : 'Standard daytime shift window'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>

          {/* Section 3: Duty Responsibilities */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'RESPONSIBILITIES'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'RESPONSIBILITIES' ? null : 'RESPONSIBILITIES')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'RESPONSIBILITIES' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Duty Responsibilities</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {responsibilities.length} Rules
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Manage checklist of duties and orders for IDAC personnel</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'RESPONSIBILITIES' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'RESPONSIBILITIES' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">
              {/* Add form */}
              <form onSubmit={handleAddResponsibility} className="flex gap-2">
                <input
                  type="text"
                  value={newRespText}
                  onChange={(e) => setNewRespText(e.target.value)}
                  placeholder="Enter new duty responsibility bullet point..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {responsibilities.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No duty responsibilities configured.
                  </div>
                ) : (
                  responsibilities.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start justify-between gap-3 text-xs"
                    >
                      {editingRespId === r.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingRespText}
                            onChange={(e) => setEditingRespText(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditResponsibility(r.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRespId(null)}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start space-x-2 text-slate-800 dark:text-slate-200 font-medium">
                            <span className="text-emerald-500 font-bold select-none">•</span>
                            <span>{r.text}</span>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRespId(r.id);
                                setEditingRespText(r.text);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResponsibility(r.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
