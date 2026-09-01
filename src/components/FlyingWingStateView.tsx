import React, { useState, useEffect } from 'react';
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
  isPrintMode?: boolean;
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
      const saved = localStorage.getItem(`flg_wg_data_${date}`);
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
    
    const handleUpdate = (e: any) => {
      if (e.detail === date) {
         setUnitsData(getSavedData());
      }
    };
    window.addEventListener('flg_wg_data_updated', handleUpdate);
    return () => window.removeEventListener('flg_wg_data_updated', handleUpdate);
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
    localStorage.setItem(`flg_wg_data_${date}`, JSON.stringify(data));
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return `${day} ${month} ${year}`;
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
    
    const existing = displayData.find(d => d.unit === addForm.unit);
    const existingData = existing || { totalStr: 0, detTdy: 0, leave: 0, edExPpgf: 0, cmhBnsBsh: 0, officeDuty: 0, baseAirfieldDuty: 0, driving: 0 };
    
    // Use the absolute values from the form
    const updatedUnit = {
      ...existingData,
      ...addForm
    };

    const newData = displayData.map(d => 
      d.unit === addForm.unit ? updatedUnit : d
    );
    
    // Save log
    let changes = [];
    if (addForm.totalStr !== existingData.totalStr) changes.push(`Total Str: ${existingData.totalStr} ➔ ${addForm.totalStr}`);
    if (addForm.detTdy !== existingData.detTdy) changes.push(`Det/Tdy: ${existingData.detTdy} ➔ ${addForm.detTdy}`);
    if (addForm.leave !== existingData.leave) changes.push(`Leave: ${existingData.leave} ➔ ${addForm.leave}`);
    if (addForm.edExPpgf !== existingData.edExPpgf) changes.push(`ED/EX: ${existingData.edExPpgf} ➔ ${addForm.edExPpgf}`);
    if (addForm.cmhBnsBsh !== existingData.cmhBnsBsh) changes.push(`CMH: ${existingData.cmhBnsBsh} ➔ ${addForm.cmhBnsBsh}`);
    if (addForm.officeDuty !== existingData.officeDuty) changes.push(`Office: ${existingData.officeDuty} ➔ ${addForm.officeDuty}`);
    if (addForm.baseAirfieldDuty !== existingData.baseAirfieldDuty) changes.push(`Base/Airfield: ${existingData.baseAirfieldDuty} ➔ ${addForm.baseAirfieldDuty}`);
    if (addForm.driving !== existingData.driving) changes.push(`Driving: ${existingData.driving} ➔ ${addForm.driving}`);
    
    if (changes.length > 0) {
      const logEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        unit: addForm.unit,
        action: changes.join(', '),
        raw: {
          totalStr: addForm.totalStr || 0,
          detTdy: addForm.detTdy || 0,
          leave: addForm.leave || 0,
          edExPpgf: addForm.edExPpgf || 0,
          cmhBnsBsh: addForm.cmhBnsBsh || 0,
          officeDuty: addForm.officeDuty || 0,
          baseAirfieldDuty: addForm.baseAirfieldDuty || 0,
          driving: addForm.driving || 0
        }
      };
      const existingLogs = JSON.parse(localStorage.getItem(`flg_wg_logs_${date}`) || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem(`flg_wg_logs_${date}`, JSON.stringify(existingLogs));
    }

    saveData(newData);
    onCloseAddModal();
  };

  const openAddModal = (unitName?: string) => {
    // Requirements: always open with blank fields.
    setAddForm({
      unit: unitName || '',
      totalStr: 0,
      detTdy: 0,
      leave: 0,
      edExPpgf: 0,
      cmhBnsBsh: 0,
      officeDuty: 0,
      baseAirfieldDuty: 0,
      driving: 0
    });
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
        <div className="text-right font-bold pr-1 text-[13px] mt-2">
          Date: {formatDateShort(date)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border border-black text-[11px]">
          <thead className="font-bold">
            <tr>
              <th className="border border-black p-1 w-24 align-middle text-center">Sqn/Unit</th>
              <th className="border border-black p-1 break-words w-8 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Total Str</div></th>
              <th className="border border-black p-1 break-words w-8 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Det/Tdy</div></th>
              <th className="border border-black p-1 break-words w-8 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Eff Str</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Leave</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Course</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Class/Exam</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">AWOL/Detention</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Sick report</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">ED/ EX PPGF</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">CMH/BNS/BSH/Qrnt</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">U/C, U/Board</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Office Duty</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Aft/Ni flg/Ni Duty/Flg</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">TF/Base/Airfield Duty</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Off Duty</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">K/O</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Mess/ Canteen /Bakery</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Driving</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">PT/Parade on Unit</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Games /Guard of Honor</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Total Out PT/Parade</div></th>
              <th className="border border-black p-1 break-words w-6 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">On PT / Parade(Forecast)</div></th>
              <th className="border border-black p-1 w-16 align-middle text-center">Rmks</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((d, index) => {
              const effStr = (d.totalStr || 0) - (d.detTdy || 0);
              const totalOut = (d.leave || 0) + (d.edExPpgf || 0) + (d.cmhBnsBsh || 0) + (d.officeDuty || 0) + (d.baseAirfieldDuty || 0) + (d.driving || 0);
              const onPt = effStr - totalOut;

              total_totalStr += d.totalStr || 0;
              total_detTdy += d.detTdy || 0;
              total_effStr += effStr;
              total_leave += d.leave || 0;
              total_edEx += d.edExPpgf || 0;
              total_cmh += d.cmhBnsBsh || 0;
              total_office += d.officeDuty || 0;
              total_tfBase += d.baseAirfieldDuty || 0;
              total_driving += d.driving || 0;
              total_totalOut += totalOut;
              total_onPt += onPt;

              return (
                <tr key={index} className="hover:bg-slate-50 cursor-pointer" onClick={() => { if(d.unit !== '155 UASU BAF') openAddModal(d.unit); }}>
                  <td className="border border-black p-1 text-left pl-2  whitespace-nowrap">{d.unit}</td>
                  <td className="border border-black p-1 ">{d.totalStr || ''}</td>
                  <td className="border border-black p-1 ">{d.detTdy || ''}</td>
                  <td className="border border-black p-1 ">{effStr === 0 ? '0' : effStr || ''}</td>
                  <td className="border border-black p-1 ">{d.leave || ''}</td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 ">{d.edExPpgf || ''}</td>
                  <td className="border border-black p-1 ">{d.cmhBnsBsh || ''}</td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 ">{d.officeDuty || ''}</td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 ">{d.baseAirfieldDuty || ''}</td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 ">{d.driving || ''}</td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 "></td>
                  <td className="border border-black p-1 ">{totalOut === 0 ? '0' : totalOut || ''}</td>
                  <td className="border border-black p-1 ">{onPt === 0 ? '0' : onPt || ''}</td>
                  <td className="border border-black p-1 "></td>
                </tr>
              );
            })}
            <tr className="font-bold bg-slate-50 text-[12px]">
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
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">0</td>
              <td className="border border-black p-1">{total_totalOut || 0}</td>
              <td className="border border-black p-1">{total_onPt || 0}</td>
              <td className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="w-full mt-16 mb-4 flex justify-start text-xs">
        <div className="flex flex-col items-start">
          <div className="mb-10 ">Prepared By</div>
          <div className="text-left">
            <div className="text-xs uppercase font-black">{preparedBy.name}</div>
            <div className="text-[11px] font-bold uppercase">{preparedBy.rank}</div>
            <div className="text-[11px] ">{preparedBy.designation}</div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg">Add Disposal</h3>
              <button onClick={() => onCloseAddModal()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-2xl transition-colors">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Unit</label>
                <div className="flex flex-wrap gap-1.5">
                  {FLYING_WING_UNITS.filter(u => u !== '155 UASU BAF').map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        const selectedUnit = u;
                        const existing = displayData.find(d => d.unit === selectedUnit);
                        setAddForm({
                          unit: selectedUnit,
                          totalStr: existing?.totalStr || 0,
                          detTdy: existing?.detTdy || 0,
                          leave: existing?.leave || 0,
                          edExPpgf: existing?.edExPpgf || 0,
                          cmhBnsBsh: existing?.cmhBnsBsh || 0,
                          officeDuty: existing?.officeDuty || 0,
                          baseAirfieldDuty: existing?.baseAirfieldDuty || 0,
                          driving: existing?.driving || 0,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        addForm.unit === u
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Total strength</label>
                  <input type="number" min="0" value={addForm.totalStr || ''} onChange={e => setAddForm({...addForm, totalStr: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Det/ Tdy</label>
                  <input type="number" min="0" value={addForm.detTdy || ''} onChange={e => setAddForm({...addForm, detTdy: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Leave</label>
                  <input type="number" min="0" value={addForm.leave || ''} onChange={e => setAddForm({...addForm, leave: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">ED/ EX-PPGF</label>
                  <input type="number" min="0" value={addForm.edExPpgf || ''} onChange={e => setAddForm({...addForm, edExPpgf: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">CMH/BNS/BSH</label>
                  <input type="number" min="0" value={addForm.cmhBnsBsh || ''} onChange={e => setAddForm({...addForm, cmhBnsBsh: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Office Duty</label>
                  <input type="number" min="0" value={addForm.officeDuty || ''} onChange={e => setAddForm({...addForm, officeDuty: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Base/Airfield Duty</label>
                  <input type="number" min="0" value={addForm.baseAirfieldDuty || ''} onChange={e => setAddForm({...addForm, baseAirfieldDuty: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Driving</label>
                  <input type="number" min="0" value={addForm.driving || ''} onChange={e => setAddForm({...addForm, driving: parseInt(e.target.value)||0})} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => onCloseAddModal()} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 dark:text-slate-400 font-medium font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all">Save Disposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPrepModalOpen && onClosePrepModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden text-slate-900 dark:text-white p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">Edit Prepared By</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Name (Block Capital)</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" value={preparedBy.name} onChange={e => savePrep({...preparedBy, name: e.target.value.toUpperCase()})} placeholder="NAME" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Rank (Capital)</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" value={preparedBy.rank} onChange={e => savePrep({...preparedBy, rank: e.target.value.toUpperCase()})} placeholder="RANK" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 font-medium mb-1">Designation</label>
                <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" value={preparedBy.designation} onChange={e => savePrep({...preparedBy, designation: e.target.value})} placeholder="DESIGNATION" />
              </div>
            </div>
            <div className="mt-5">
              <button onClick={onClosePrepModal} className="w-full px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
