const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { SignatureDetails } from './SignatureConfigModal';

interface FlyingWingUnitData {
  unit: string;
  totalStr: number;
  detTdy: number;
  leave: number;
  edExPpgf: number;
  cmhBnsBsh: number;
  officeDuty: number;
  baseAirfieldDuty: number;
  driving: number;
}

interface FlyingWingStateViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
  isPrepModalOpen?: boolean;
  onClosePrepModal?: () => void;
  date: string;
  uasuStats: any;
}

const FLYING_WING_UNITS = [
  'Flg WG HQ', '1 SQN BAF', '3 SQN BAF', '5 SQN BAF', 
  '21 SQN BAF', '105 AJTU BAF', '155 UASU BAF', '301 SAM UNIT'
];

export const FlyingWingStateView: React.FC<FlyingWingStateViewProps> = ({
  date,
  uasuStats,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
  isPrepModalOpen,
  onClosePrepModal
}) => {
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(\`flg_wg_data_\${date}\`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return FLYING_WING_UNITS.map(unit => ({
      unit, totalStr: 0, detTdy: 0, leave: 0, edExPpgf: 0, cmhBnsBsh: 0,
      officeDuty: 0, baseAirfieldDuty: 0, driving: 0
    }));
  };

  const [unitsData, setUnitsData] = useState<FlyingWingUnitData[]>(getSavedData());
  
  useEffect(() => {
    setUnitsData(getSavedData());
  }, [date]);

  const getSavedPrep = () => {
    try {
      const saved = localStorage.getItem('flg_wg_prepared_by');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: '', rank: '', designation: '' };
  };
  const [preparedBy, setPreparedBy] = useState<SignatureDetails>(getSavedPrep());

  const savePrep = (prep: SignatureDetails) => {
    setPreparedBy(prep);
    localStorage.setItem('flg_wg_prepared_by', JSON.stringify(prep));
  };

  const saveData = (data: FlyingWingUnitData[]) => {
    setUnitsData(data);
    localStorage.setItem(\`flg_wg_data_\${date}\`, JSON.stringify(data));
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'dd MMM yy');
    } catch (e) {
      return dateStr;
    }
  };

  const displayData = unitsData.map(d => {
    if (d.unit === '155 UASU BAF' && uasuStats) {
      return {
        ...d,
        totalStr: uasuStats.totalStr || 0,
        detTdy: uasuStats.detTdy || 0,
        leave: uasuStats.leave || 0,
        edExPpgf: uasuStats.edEx || 0,
        cmhBnsBsh: uasuStats.cmh || 0,
        officeDuty: uasuStats.office || 0,
        baseAirfieldDuty: uasuStats.baseAirfield || 0,
        driving: uasuStats.driving || 0
      };
    }
    return d;
  });

  const [addForm, setAddForm] = useState<FlyingWingUnitData>({
    unit: '', totalStr: 0, detTdy: 0, leave: 0, edExPpgf: 0, cmhBnsBsh: 0,
    officeDuty: 0, baseAirfieldDuty: 0, driving: 0
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.unit) return;
    
    const newData = unitsData.map(d => 
      d.unit === addForm.unit ? { ...addForm } : d
    );
    saveData(newData);
    onCloseAddModal();
  };

  const openAddModal = (unitName?: string) => {
    const existing = displayData.find(d => d.unit === (unitName || 'Flg WG HQ'));
    if (existing) {
      setAddForm({ ...existing });
    }
    onOpenAddModal();
  };

  // Calculations for totals
  let total_totalStr = 0, total_detTdy = 0, total_effStr = 0, total_leave = 0, total_course = 0;
  let total_classExam = 0, total_awol = 0, total_sick = 0, total_edEx = 0, total_cmh = 0;
  let total_uc = 0, total_office = 0, total_aftNi = 0, total_tfBase = 0, total_offDuty = 0;
  let total_ko = 0, total_mess = 0, total_driving = 0, total_ptUnit = 0, total_games = 0;
  let total_totalOut = 0, total_onPt = 0;

  return (
    <div className="bg-white text-black w-full min-h-screen p-4 sm:p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="relative mb-6 text-center">
        <h1 className="font-bold tracking-wide underline inline-block text-base uppercase">
          CONSOLIDATED NIGHT COUNT STATE : BAF AIRMEN
        </h1>
        <br />
        <h2 className="font-bold tracking-wide mt-1 underline inline-block text-base uppercase">
          FLG WG
        </h2>
        <div className="text-right font-normal pr-1 text-xs mt-2">
          Date: {formatDateShort(date)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[9px] border-collapse" style={{ textAlign: 'center' }}>
          <thead>
            <tr>
              <th rowSpan={2} className="border border-black p-1 w-24">Sqn/Unit</th>
              <th rowSpan={2} className="border border-black p-1 break-words w-8">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Total Str</div>
              </th>
              <th rowSpan={2} className="border border-black p-1 break-words w-8">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Det/Tdy</div>
              </th>
              <th rowSpan={2} className="border border-black p-1 break-words w-8">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Eff Str</div>
              </th>
              <th colSpan={15} className="border border-black p-1">Non-Effective</th>
              <th rowSpan={2} className="border border-black p-1 break-words w-8">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Total Non Eff</div>
              </th>
              <th rowSpan={2} className="border border-black p-1 break-words w-8">
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">On Pt</div>
              </th>
              <th rowSpan={2} className="border border-black p-1 w-16">Remarks</th>
            </tr>
            <tr>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Leave</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Course</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Class/Exam</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">AWOL/Detention</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Sick report</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">ED/EX PPGF</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">CMH/BNS/BSH/MI Room</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">UC/QRT</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Office Duty</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">AFT/NI</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Tf Base/Airfd Duty</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Off Duty</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">KO</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Mess Appt</div></th>
              <th className="border border-black p-1 w-6"><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">Driving</div></th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((d, index) => {
              const effStr = d.totalStr - d.detTdy;
              const totalOut = d.leave + d.edExPpgf + d.cmhBnsBsh + d.officeDuty + d.baseAirfieldDuty + d.driving;
              const onPt = effStr - totalOut;

              total_totalStr += d.totalStr;
              total_detTdy += d.detTdy;
              total_effStr += effStr;
              total_leave += d.leave;
              total_edEx += d.edExPpgf;
              total_cmh += d.cmhBnsBsh;
              total_office += d.officeDuty;
              total_tfBase += d.baseAirfieldDuty;
              total_driving += d.driving;
              total_totalOut += totalOut;
              total_onPt += onPt;

              return (
                <tr key={index} className="hover:bg-slate-50 cursor-pointer" onClick={() => { if(d.unit !== '155 UASU BAF') openAddModal(d.unit); }}>
                  <td className="border border-black p-1 text-left pl-2 font-bold whitespace-nowrap">{d.unit}</td>
                  <td className="border border-black p-1">{d.totalStr || ''}</td>
                  <td className="border border-black p-1">{d.detTdy || ''}</td>
                  <td className="border border-black p-1">{effStr || ''}</td>
                  <td className="border border-black p-1">{d.leave || ''}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1">{d.edExPpgf || ''}</td>
                  <td className="border border-black p-1">{d.cmhBnsBsh || ''}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1">{d.officeDuty || ''}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1">{d.baseAirfieldDuty || ''}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1">{d.driving || ''}</td>
                  <td className="border border-black p-1 font-bold">{totalOut || ''}</td>
                  <td className="border border-black p-1 font-bold">{onPt || ''}</td>
                  <td className="border border-black p-1"></td>
                </tr>
              );
            })}
            <tr className="font-bold bg-slate-50">
              <td className="border border-black p-1 text-left pl-2">Total</td>
              <td className="border border-black p-1">{total_totalStr || 0}</td>
              <td className="border border-black p-1">{total_detTdy || 0}</td>
              <td className="border border-black p-1">{total_effStr || 0}</td>
              <td className="border border-black p-1">{total_leave || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_edEx || 0}</td>
              <td className="border border-black p-1">{total_cmh || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_office || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_tfBase || 0}</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_driving || 0}</td>
              <td className="border border-black p-1">{total_totalOut || 0}</td>
              <td className="border border-black p-1">{total_onPt || 0}</td>
              <td className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="w-full mt-16 mb-4 flex justify-end text-xs">
        <div className="text-center min-w-[150px]">
          <div className="mb-10 font-normal text-left">Prepared By</div>
          <div className="text-left">
            <div className="text-xs uppercase font-black">{preparedBy.name}</div>
            <div className="text-[11px] font-bold uppercase">{preparedBy.rank}</div>
            <div className="text-[11px] font-normal">{preparedBy.designation}</div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg">Add Disposal</h3>
              <button onClick={() => onCloseAddModal()} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                <select 
                  required
                  value={addForm.unit}
                  onChange={(e) => setAddForm({...addForm, unit: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select Unit</option>
                  {FLYING_WING_UNITS.filter(u => u !== '155 UASU BAF').map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total strength</label>
                  <input type="number" min="0" value={addForm.totalStr || ''} onChange={e => setAddForm({...addForm, totalStr: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Det/ Tdy</label>
                  <input type="number" min="0" value={addForm.detTdy || ''} onChange={e => setAddForm({...addForm, detTdy: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Leave</label>
                  <input type="number" min="0" value={addForm.leave || ''} onChange={e => setAddForm({...addForm, leave: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ED/ EX-PPGF</label>
                  <input type="number" min="0" value={addForm.edExPpgf || ''} onChange={e => setAddForm({...addForm, edExPpgf: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CMH/BNS/BSH</label>
                  <input type="number" min="0" value={addForm.cmhBnsBsh || ''} onChange={e => setAddForm({...addForm, cmhBnsBsh: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office Duty</label>
                  <input type="number" min="0" value={addForm.officeDuty || ''} onChange={e => setAddForm({...addForm, officeDuty: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base/Airfield Duty</label>
                  <input type="number" min="0" value={addForm.baseAirfieldDuty || ''} onChange={e => setAddForm({...addForm, baseAirfieldDuty: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driving</label>
                  <input type="number" min="0" value={addForm.driving || ''} onChange={e => setAddForm({...addForm, driving: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => onCloseAddModal()} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Save Disposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPrepModalOpen && onClosePrepModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-slate-800 p-5">
            <h3 className="font-bold text-lg mb-4">Edit Prepared By</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name (Block Capital)</label>
                <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg uppercase" value={preparedBy.name} onChange={e => savePrep({...preparedBy, name: e.target.value.toUpperCase()})} placeholder="NAME" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rank (Capital)</label>
                <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg uppercase" value={preparedBy.rank} onChange={e => savePrep({...preparedBy, rank: e.target.value.toUpperCase()})} placeholder="RANK" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" value={preparedBy.designation} onChange={e => savePrep({...preparedBy, designation: e.target.value})} placeholder="DESIGNATION" />
              </div>
            </div>
            <div className="mt-5">
              <button onClick={onClosePrepModal} className="w-full px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`
fs.writeFileSync('src/components/FlyingWingStateView.tsx', content);
