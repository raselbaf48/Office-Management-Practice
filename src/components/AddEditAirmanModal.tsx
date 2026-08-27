import React, { useState, useEffect } from 'react';
import { Airman, FlightName, Rank } from '../types';
import { X, Check, Building2, Home, MapPin, User, Phone, Shield } from 'lucide-react';

interface AddEditAirmanModalProps {
  airmanToEdit?: Airman | null;
  onSave: (airmanData: Partial<Airman>) => void;
  onClose: () => void;
}

export const AddEditAirmanModal: React.FC<AddEditAirmanModalProps> = ({
  airmanToEdit,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(airmanToEdit?.name || '');
  const [bdNo, setBdNo] = useState(airmanToEdit?.bdNo || 'BD/4');
  const [code, setCode] = useState(airmanToEdit?.code || '');
  const [rank, setRank] = useState<Rank>(airmanToEdit?.rank || 'LAC');
  const [trade, setTrade] = useState(airmanToEdit?.trade || 'Avionic Tech');
  const [flightName, setFlightName] = useState<FlightName>(
    airmanToEdit?.flightName || 'Avionics'
  );
  const [mobileNo, setMobileNo] = useState(airmanToEdit?.mobileNo || '01');
  const [remarks, setRemarks] = useState(airmanToEdit?.remarks || '');

  // Address Selection States: L/In vs L/Out
  const [livingType, setLivingType] = useState<'L_IN' | 'L_OUT'>(() => {
    if (airmanToEdit?.addressBlock) {
      const lower = airmanToEdit.addressBlock.toLowerCase();
      if (lower.includes('qtr') || lower.includes('quarter') || lower.includes('outside')) {
        return 'L_OUT';
      }
    }
    return 'L_IN';
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
    if (airmanToEdit?.addressBlock && airmanToEdit.addressBlock.toLowerCase().includes('outside')) {
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
    if (airmanToEdit?.addressBlock && airmanToEdit.addressBlock.toLowerCase().includes('outside')) {
      return airmanToEdit.addressBlock.replace(/Outside\s*Base[:\s]*/gi, '').trim();
    }
    return '';
  });

  // Check if current rank is Sgt or above (MWO, SWO, WO, SGT, Sgt)
  const isSgtOrAbove = (r: Rank) => {
    return ['MWO', 'SWO', 'WO', 'SGT', 'Sgt'].includes(r);
  };

  // Rank List requested by user: MWO, SWO, WO, SGT, CPL, LAC, AC
  const ranksList: Rank[] = ['MWO', 'SWO', 'WO', 'SGT', 'CPL', 'LAC', 'AC'];

  // Handle BD No formatting (ensure prefix starts with BD/4 or custom if user edits)
  const handleBdNoChange = (val: string) => {
    setBdNo(val);
  };

  // Handle Mobile No formatting (ensure starts with 01)
  const handleMobileChange = (val: string) => {
    setMobileNo(val);
  };

  // Compute final address string
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
    if (!name.trim()) {
      alert('Please fill in required field: Name');
      return;
    }
    if (!bdNo.trim() || bdNo.trim() === 'BD/') {
      alert('Please enter a valid BD Number');
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
              <h2 className="text-base font-black tracking-tight">
                {airmanToEdit ? 'Edit Airman Record' : 'Add New Airman'}
              </h2>
              <p className="text-[11px] text-emerald-300/80 font-medium">
                155 UASU BAF • Nominal Roll Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Full Name & BD Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Md. Tanvir Hasan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                BD Number (BD/4...) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BD/408150"
                value={bdNo}
                onChange={(e) => handleBdNoChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Rank & Flight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Rank (BAF Hierarchy) *
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as Rank)}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {ranksList.map((r) => (
                  <option key={r} value={r}>
                    {r} {r === 'MWO' ? '(Master Warrant Officer)' : r === 'SWO' ? '(Senior Warrant Officer)' : r === 'WO' ? '(Warrant Officer)' : r === 'SGT' ? '(Sergeant)' : r === 'CPL' ? '(Corporal)' : r === 'LAC' ? '(Leading Aircraftman)' : '(Aircraftman)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Flight *
              </label>
              <select
                value={flightName}
                onChange={(e) => setFlightName(e.target.value as FlightName)}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((fl) => (
                  <option key={fl} value={fl}>
                    {fl} Flight
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trade Specialty & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Trade Specialty
              </label>
              <input
                type="text"
                placeholder="e.g. Avionic Tech, Aero Mech, Radar Tech..."
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Mobile Number (Starts with 01)
              </label>
              <input
                type="text"
                placeholder="01711223344"
                value={mobileNo}
                onChange={(e) => handleMobileChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Address Section with L/In and L/Out */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="font-black text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Accommodation / Living Status</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                BAF Address Format
              </span>
            </div>

            {/* 2 Main Options: L/In and L/Out */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLivingType('L_IN')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  livingType === 'L_IN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>L / In (Living In)</span>
              </button>

              <button
                type="button"
                onClick={() => setLivingType('L_OUT')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                  livingType === 'L_OUT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>L / Out (Living Out)</span>
              </button>
            </div>

            {/* Dynamic Content Based on L/In or L/Out */}
            {livingType === 'L_IN' ? (
              <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Mess Allocation:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {isSgtOrAbove(rank) ? "Sgt's Mess (Auto for Sgt & Above)" : "Airmen's Mess (Auto for Cpl & Below)"}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Block No :
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Block-01, Room-204"
                    value={blockNo}
                    onChange={(e) => setBlockNo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLivingOutType('QUARTER')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      livingOutType === 'QUARTER'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Quarter (Service Qtr)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLivingOutType('OUTSIDE_BASE')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      livingOutType === 'OUTSIDE_BASE'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Outside Base
                  </button>
                </div>

                {livingOutType === 'QUARTER' ? (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Svc Qtr No :
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Qtr No 14/B, BAF Base ZH"
                      value={svcQtrNo}
                      onChange={(e) => setSvcQtrNo(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Outside Base Custom Address :
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. House 12, Road 4, Agrabad, Chattogram"
                      value={outsideAddress}
                      onChange={(e) => setOutsideAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Computed Preview */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
              <span className="font-semibold">Recorded Address:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                {computeFinalAddress()}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Tech Specialist, Guard Pool, Flight In-Charge..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{airmanToEdit ? 'Save Changes' : 'Add Airman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
