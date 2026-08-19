import React, { useState } from 'react';
import { Airman, FlightName, Rank } from '../types';
import { X, Check } from 'lucide-react';

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
  const [bdNo, setBdNo] = useState(airmanToEdit?.bdNo || 'BD/408');
  const [code, setCode] = useState(airmanToEdit?.code || '');
  const [rank, setRank] = useState<Rank>(airmanToEdit?.rank || 'LAC');
  const [trade, setTrade] = useState(airmanToEdit?.trade || 'Avionic Tech');
  const [flightName, setFlightName] = useState<FlightName>(
    airmanToEdit?.flightName || 'Avionics'
  );
  const [addressBlock, setAddressBlock] = useState(airmanToEdit?.addressBlock || 'Barrack No 01');
  const [mobileNo, setMobileNo] = useState(airmanToEdit?.mobileNo || '01711223300');
  const [remarks, setRemarks] = useState(airmanToEdit?.remarks || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bdNo) {
      alert('Please fill in required fields: Name and BD Number');
      return;
    }

    onSave({
      name,
      bdNo,
      code: code || `${rank}-${name.slice(0, 3).toUpperCase()}`,
      rank,
      trade,
      flightName,
      addressBlock,
      mobileNo,
      remarks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <h2 className="text-base font-bold">
            {airmanToEdit ? 'Edit Airman Details' : 'Add New Airman to Nominal Roll'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Md. Tanvir Hasan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                BD Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BD/408150"
                value={bdNo}
                onChange={(e) => setBdNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Rank
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as Rank)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                {(['SWO', 'WO', 'Sgt', 'Cpl', 'LAC'] as Rank[]).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Flight
              </label>
              <select
                value={flightName}
                onChange={(e) => setFlightName(e.target.value as FlightName)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map(
                  (fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Trade Specialty
              </label>
              <input
                type="text"
                placeholder="e.g. Aero Mech, Radar Tech..."
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="e.g. 01711223344"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Address / Quarter / Barrack
            </label>
            <input
              type="text"
              placeholder="e.g. Block-B Qtr 102 or Barrack No 03"
              value={addressBlock}
              onChange={(e) => setAddressBlock(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Flight In-Charge Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Tech Specialist, Guard Pool..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
            >
              Save Airman Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
