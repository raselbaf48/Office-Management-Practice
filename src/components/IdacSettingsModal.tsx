import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Edit2, Check, AlertTriangle, Phone, CheckCircle2, RotateCcw, UserPlus, Users, Search, MessageSquare } from 'lucide-react';
import {
  IdacResponsibility,
  IdacEmergencyContact,
  getIdacResponsibilities,
  saveIdacResponsibilities,
  getIdacEmergencyContacts,
  saveIdacEmergencyContacts,
} from '../data/idacSettings';
import { Airman } from '../types';

interface IdacSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  airmen?: Airman[];
}

export const IdacSettingsModal: React.FC<IdacSettingsModalProps> = ({ isOpen, onClose, airmen = [] }) => {
  const [activeTab, setActiveTab] = useState<'RESPONSIBILITIES' | 'CONTACTS'>('RESPONSIBILITIES');

  // Responsibilities state
  const [responsibilities, setResponsibilities] = useState<IdacResponsibility[]>([]);
  const [newRespText, setNewRespText] = useState<string>('');
  const [editingRespId, setEditingRespId] = useState<string | null>(null);
  const [editingRespText, setEditingRespText] = useState<string>('');

  // Contacts state
  const [contacts, setContacts] = useState<IdacEmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactRank, setNewContactRank] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactWhatsapp, setNewContactWhatsapp] = useState<string>('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContactData, setEditContactData] = useState<Partial<IdacEmergencyContact>>({});

  // Nominal Roll Selector state
  const [nominalSearch, setNominalSearch] = useState<string>('');
  const [showNominalPicker, setShowNominalPicker] = useState<boolean>(false);

  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setResponsibilities(getIdacResponsibilities());
      setContacts(getIdacEmergencyContacts());
      setNewRespText('');
      setEditingRespId(null);
      setEditingContactId(null);
      setToastMsg('');
      setNominalSearch('');
      setShowNominalPicker(false);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
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
    const updated = responsibilities.map((r) => (r.id === id ? { ...r, text: editingRespText.trim() } : r));
    setResponsibilities(updated);
    saveIdacResponsibilities(updated);
    setEditingRespId(null);
    showToast('Responsibility updated.');
  };

  // Contacts Handlers
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      alert('Please provide at least a Name and Phone number.');
      return;
    }
    const cleanPhone = newContactPhone.trim();
    const cleanWhatsapp = newContactWhatsapp.trim() || cleanPhone;
    const newContact: IdacEmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      rankDesignation: newContactRank.trim() || 'Officer / Airman',
      phone: cleanPhone,
      whatsappPhone: cleanWhatsapp,
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    setNewContactName('');
    setNewContactRank('');
    setNewContactPhone('');
    setNewContactWhatsapp('');
    showToast('Emergency contact added.');
  };

  const handleSelectAirmanFromNominal = (airman: Airman) => {
    const phone = airman.mobileNo?.trim() || '';
    const newContact: IdacEmergencyContact = {
      id: Date.now().toString(),
      name: `${airman.rank} ${airman.name}`,
      rankDesignation: `${airman.rank} (${airman.flightName} Flt)`,
      phone: phone || '01XXXXXXXXX',
      whatsappPhone: phone || '01XXXXXXXXX',
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    setShowNominalPicker(false);
    showToast(`Added ${airman.rank} ${airman.name} to Emergency Contacts.`);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    showToast('Emergency contact removed.');
  };

  const handleSaveEditContact = (id: string) => {
    if (!editContactData.name || !editContactData.phone) return;
    const updated = contacts.map((c) =>
      c.id === id
        ? {
            ...c,
            name: editContactData.name!,
            rankDesignation: editContactData.rankDesignation || c.rankDesignation,
            phone: editContactData.phone!,
            whatsappPhone: editContactData.whatsappPhone || editContactData.phone!,
          }
        : c
    );
    setContacts(updated);
    saveIdacEmergencyContacts(updated);
    setEditingContactId(null);
    showToast('Emergency contact updated.');
  };

  // Filtered Nominal Roll airmen
  const filteredNominalAirmen = useMemo(() => {
    if (!airmen || airmen.length === 0) return [];
    if (!nominalSearch.trim()) return airmen;
    const q = nominalSearch.toLowerCase();
    return airmen.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q) ||
        a.bdNo.toLowerCase().includes(q) ||
        a.flightName.toLowerCase().includes(q) ||
        (a.mobileNo && a.mobileNo.includes(q))
    );
  }, [airmen, nominalSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <span>IDA Center Duty Settings</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage operational responsibilities and emergency contact list
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('RESPONSIBILITIES')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'RESPONSIBILITIES'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Duty Responsibilities ({responsibilities.length})
          </button>
          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CONTACTS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Emergency Contacts ({contacts.length})
          </button>
        </div>

        {/* Toast Banner */}
        {toastMsg && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'RESPONSIBILITIES' ? (
            <div className="space-y-4">
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
          ) : (
            <div className="space-y-4">
              {/* Nominal Roll Pick Option */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Add from Nominal Roll</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNominalPicker(!showNominalPicker)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showNominalPicker ? 'Hide List' : 'Browse Nominal Roll'}</span>
                  </button>
                </div>

                {showNominalPicker && (
                  <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/50 animate-fadeIn">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={nominalSearch}
                        onChange={(e) => setNominalSearch(e.target.value)}
                        placeholder="Search airman by name, rank, BD no, or phone..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredNominalAirmen.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No matching airmen found in Nominal Roll.
                        </div>
                      ) : (
                        filteredNominalAirmen.slice(0, 30).map((a) => (
                          <div
                            key={a.id}
                            className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-emerald-400 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                                <span>{a.rank} {a.name}</span>
                                <span className="text-[10px] font-normal px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                  {a.flightName}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {a.mobileNo ? `📞 ${a.mobileNo}` : 'No phone registered'}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectAirmanFromNominal(a)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Add contact form */}
              <form onSubmit={handleAddContact} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Or Add Custom Contact
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Officer / Contact Name (e.g. WO A Baten)"
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newContactRank}
                    onChange={(e) => setNewContactRank(e.target.value)}
                    placeholder="Rank / Designation (e.g. Warrant Officer)"
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="Phone Number (e.g. 01712361050)"
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newContactWhatsapp}
                    onChange={(e) => setNewContactWhatsapp(e.target.value)}
                    placeholder="Chat / Direct Number (if different)"
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Contact</span>
                  </button>
                </div>
              </form>

              {/* Contacts list with Add/Remove */}
              <div className="space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Emergency Contacts ({contacts.length})
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No emergency contacts configured.
                  </div>
                ) : (
                  contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between text-xs"
                    >
                      {editingContactId === c.id ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editContactData.name || ''}
                              onChange={(e) => setEditContactData({ ...editContactData, name: e.target.value })}
                              placeholder="Name"
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={editContactData.phone || ''}
                              onChange={(e) => setEditContactData({ ...editContactData, phone: e.target.value })}
                              placeholder="Phone"
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
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
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                              <span>{c.name}</span>
                              {c.rankDesignation && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-normal">
                                  {c.rankDesignation}
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center space-x-2">
                              <span>📞 {c.phone}</span>
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

