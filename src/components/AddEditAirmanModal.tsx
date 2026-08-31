import React, { useState } from 'react';
import { Airman, FlightName, Rank } from '../types';
import { X, Check, Building2, Home, MapPin, User, Phone, Shield, AlertCircle } from 'lucide-react';

interface AddEditAirmanModalProps {
  airmanToEdit?: Airman | null;
  existingAirmen?: Airman[];
  onSave: (airmanData: Partial<Airman>) => void;
  onClose: () => void;
}

export const AddEditAirmanModal: React.FC<AddEditAirmanModalProps> = ({
  airmanToEdit,
  existingAirmen = [],
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(airmanToEdit?.name || '');
  const [bdNo, setBdNo] = useState(airmanToEdit?.bdNo || '');
  const [code, setCode] = useState(airmanToEdit?.code || '');
  const [rank, setRank] = useState<Rank | ''>(airmanToEdit?.rank || '');
  const [trade, setTrade] = useState(airmanToEdit?.trade || '');
    const [flightName, setFlightName] = useState<FlightName>(
    airmanToEdit?.flightName || 'Avionics'
  );
  const [mobileNo, setMobileNo] = useState(airmanToEdit?.mobileNo || '');
  const [remarks, setRemarks] = useState(airmanToEdit?.remarks || '');
  const [validationError, setValidationError] = useState<string>('');

  // Address Selection States: L/In vs L/Out
  const [livingType, setLivingType] = useState<'L_IN' | 'L_OUT' | null>(() => {
    if (airmanToEdit?.addressBlock) {
      const lower = airmanToEdit.addressBlock.toLowerCase();
      if (lower.includes('qtr') || lower.includes('quarter') || lower.includes('outside') || lower.includes('maizpara')) {
        return 'L_OUT';
      }
    }
    return null;
  });

  // L/In specific state
  const [blockNo, setBlockNo] = useState<string>(() => {
    if (airmanToEdit?.addressBlock) {
      const match = airmanToEdit.addressBlock.match(/Block\s*(?:No[:\s]*)?([^,]+)/i);
      if (match) return match[1].trim();
      return airmanToEdit.addressBlock.replace(/Airmen's Mess|Sgt's Mess|Mess/gi, '').replace(/^[,\s:-]+/, '').trim();
    }
    return '';
  });

  // L/Out specific states
  const [livingOutType, setLivingOutType] = useState<'QUARTER' | 'OUTSIDE_BASE'>(() => {
    if (airmanToEdit?.addressBlock && (airmanToEdit.addressBlock.toLowerCase().includes('outside') || airmanToEdit.addressBlock.toLowerCase().includes('maizpara'))) {
      return 'OUTSIDE_BASE';
    }
    return 'QUARTER';
  });

  const [svcQtrNo, setSvcQtrNo] = useState<string>(() => {
    if (airmanToEdit?.addressBlock) {
      const match = airmanToEdit.addressBlock.match(/Svc\s*Qtr\s*(?:No[:\s]*)?([^,]+)/i) || airmanToEdit.addressBlock.match(/Qtr\s*(?:No[:\s]*)?([^,]+)/i);
      if (match) return match[1].trim();
      if (airmanToEdit.addressBlock.toLowerCase().includes('qtr')) {
        return airmanToEdit.addressBlock.replace(/Svc|Qtr|No|:/gi, '').trim();
      }
    }
    return '';
  });

  const [outsideAddress, setOutsideAddress] = useState<string>(() => {
    if (airmanToEdit?.addressBlock && (airmanToEdit.addressBlock.toLowerCase().includes('outside') || airmanToEdit.addressBlock.toLowerCase().includes('maizpara'))) {
      return airmanToEdit.addressBlock.replace(/Outside\s*Base[:\s]*/gi, '').trim();
    }
    return '';
  });

  const isSgtOrAbove = (r: Rank) => {
    return ['MWO', 'SWO', 'WO', 'Sgt'].includes(r);
  };

  const ranksList: Rank[] = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];

  const computeFinalAddress = (): string => {
    if (livingType === 'L_IN') {
      const messType = isSgtOrAbove(rank) ? "Sgt's Mess" : "Airmen's Mess";
      if (blockNo.trim()) {
        return `${messType}, Block No: ${blockNo.trim()}`;
      }
      return messType;
    } else {
      if (livingOutType === 'QUARTER') {
        if (svcQtrNo.trim()) {
          return `Svc Qtr No: ${svcQtrNo.trim()}`;
        }
        return 'Svc Qtr';
      } else {
        if (outsideAddress.trim()) {
          return `Outside Base: ${outsideAddress.trim()}`;
        }
        return 'Outside Base';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) return setValidationError('Please fill in required field: Name');
    if (!bdNo.trim() || bdNo.trim() === 'BD/' || bdNo.trim() === 'BD') return setValidationError('Please enter a valid BD Number');
    if (!rank) return setValidationError('Please select a Rank');
    if (!trade.trim()) return setValidationError('Please enter a Trade');
    if (!mobileNo.trim() || mobileNo.trim() === '01') return setValidationError('Please enter a valid Mobile Number');
    
    if (!livingType) return setValidationError('Please select Living Status (L/In or L/Out)');
    if (livingType === 'L_IN' && !blockNo.trim()) return setValidationError('Please enter Block No for Live-In address');
    if (livingType === 'L_OUT') {
      if (livingOutType === 'QUARTER' && !svcQtrNo.trim()) return setValidationError('Please enter Service Quarter Number');
      if (livingOutType === 'OUTSIDE_BASE' && !outsideAddress.trim()) return setValidationError('Please enter Outside Base Address');
    }

    // BD Number Uniqueness check (Part 2)
    const normalizedNewBd = bdNo.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
    const duplicateAirman = existingAirmen.find((a) => {
      if (airmanToEdit && a.id === airmanToEdit.id) return false;
      const existingBd = a.bdNo.trim().replace(/^BD\/?/i, '').replace(/\s+/g, '').toLowerCase();
      return existingBd === normalizedNewBd;
    });

    if (duplicateAirman) {
      setValidationError(`An airman with BD Number ${bdNo.trim()} (${duplicateAirman.rank} ${duplicateAirman.name} - ${duplicateAirman.flightName}) already exists in the Nominal Roll.`);
      return;
    }

    const finalAddress = computeFinalAddress();

    onSave({
      name: name.trim(),
      bdNo: bdNo.trim(),
      code: code || `${rank}-${name.slice(0, 3).toUpperCase()}`,
      rank,
      trade: trade.trim() || 'General Tech',
      flightName,
      addressBlock: finalAddress,
      mobileNo: mobileNo.trim() || '01',
      remarks: remarks.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {airmanToEdit ? 'Edit Airman Details' : 'Add New Airman to Nominal Roll'}
              </h2>
              <p className="text-xs text-emerald-300/80">155 UASU BAF • Personnel Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-2.5 text-xs text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Name & BD No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Rizwan Islam Rasel"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                BD Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bdNo}
                onChange={(e) => {
                  setBdNo(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="478546"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Rank & Trade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rank <span className="text-red-500">*</span>
              </label>
              <select
                value={rank}
                required
                onChange={(e) => {
                  setRank(e.target.value as Rank);
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="" disabled>Select Rank</option>
                {ranksList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="trade-options"
                value={trade}
                required
                onChange={(e) => {
                  setTrade(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Select or type Trade"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="trade-options">
                {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst', 'ATCA'].map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Flight & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Flight <span className="text-red-500">*</span>
              </label>
              <select
                value={flightName}
                onChange={(e) => setFlightName(e.target.value as FlightName)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Avionics">Avionics Flight</option>
                <option value="Mechanics">Mechanics Flight</option>
                <option value="GCS">GCS Flight</option>
                <option value="Admin">Admin Flight</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mobileNo}
                onChange={(e) => {
                  setMobileNo(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="01000000000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Address Configuration (L/In vs L/Out) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Living Status & Address</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Official Accommodation</span>
            </div>

            {/* Living Type Buttons: L/In vs L/Out */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLivingType('L_IN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  livingType === 'L_IN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Living In (L/In)</span>
              </button>

              <button
                type="button"
                onClick={() => setLivingType('L_OUT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  livingType === 'L_OUT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Living Out (L/Out)</span>
              </button>
            </div>

            {/* Sub-inputs based on living type */}
            {livingType === 'L_IN' ? (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Mess: <strong className="text-slate-800 dark:text-slate-200">{isSgtOrAbove(rank) ? "Sgt's Mess" : "Airmen's Mess"}</strong> (Automatic by Rank)
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Block No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blockNo}
                    onChange={(e) => {
                      setBlockNo(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="123/04"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="livingOutType"
                      checked={livingOutType === 'QUARTER'}
                      onChange={() => setLivingOutType('QUARTER')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Service Quarter (Inside Base)</span>
                  </label>

                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="livingOutType"
                      checked={livingOutType === 'OUTSIDE_BASE'}
                      onChange={() => setLivingOutType('OUTSIDE_BASE')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Outside Base</span>
                  </label>
                </div>

                {livingOutType === 'QUARTER' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quarter Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={svcQtrNo}
                      onChange={(e) => {
                        setSvcQtrNo(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      placeholder="79/05"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Outside Residence Address / Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={outsideAddress}
                      onChange={(e) => {
                        setOutsideAddress(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      placeholder="Halishahar, Agrabad, Patenga"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Special Remarks / Qualifications <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="UAV Operator, Shift IC, Medic Qualified"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{airmanToEdit ? 'Update Airman' : 'Add to Nominal Roll'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
