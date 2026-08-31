import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, Calculator } from 'lucide-react';

interface DutyRatioSettingsModalProps {
  onClose: () => void;
}

const DEFAULT_TOTAL_DUTY = {
  syDuty: 88,
  btfDuty: 22,
  ntfDuty: 40,
  idacMorning: 31,
  idacAfternoon: 31,
  idacNight: 62,
  reception: 31,
  airfieldDuty: 93,
};


const DEFAULT_MANPOWER = {
  mechSgt: 5,
  mechCpl: 6,
  aviSgt: 4,
  aviCpl: 3,
  gcsSgt: 5,
  gcsCpl: 6,
  adminSgt: 0,
  adminCpl: 1,
};

export const DutyRatioSettingsModal: React.FC<DutyRatioSettingsModalProps> = ({ onClose }) => {
  const [totalDuty, setTotalDuty] = useState(DEFAULT_TOTAL_DUTY);
  const [manpower, setManpower] = useState(DEFAULT_MANPOWER);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedDuty = localStorage.getItem('baf_duty_distribution_total_duty');
    const savedManpower = localStorage.getItem('baf_duty_distribution_manpower');
    if (savedDuty) setTotalDuty(JSON.parse(savedDuty));
    if (savedManpower) setManpower(JSON.parse(savedManpower));
  }, []);

  const handleSave = () => {
    localStorage.setItem('baf_duty_distribution_total_duty', JSON.stringify(totalDuty));
    localStorage.setItem('baf_duty_distribution_manpower', JSON.stringify(manpower));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Calculations
  const totalCpl = manpower.mechCpl + manpower.aviCpl + manpower.gcsCpl + manpower.adminCpl;
  const totalSgt = manpower.mechSgt + manpower.aviSgt + manpower.gcsSgt + manpower.adminSgt;
  const totalAll = totalCpl + totalSgt;

  const getFltTotal = (sgt: number, cpl: number) => sgt + cpl;
  
  const dpp = {
    syDuty: totalCpl > 0 ? (totalDuty.syDuty / totalCpl) : 0,
    btfDuty: totalAll > 0 ? (totalDuty.btfDuty / totalAll) : 0,
    ntfDuty: totalAll > 0 ? (totalDuty.ntfDuty / totalAll) : 0,
    morning: totalAll > 0 ? (totalDuty.idacMorning / totalAll) : 0,
    afternoon: totalAll > 0 ? (totalDuty.idacAfternoon / totalAll) : 0,
    night: totalAll > 0 ? (totalDuty.idacNight / totalAll) : 0,
    reception: totalAll > 0 ? (totalDuty.reception / totalAll) : 0,
    airfield: totalAll > 0 ? (totalDuty.airfieldDuty / totalAll) : 0,
  };

  const getFltRow = (name: string, cpl: number, sgt: number) => {
    const fltTotal = cpl + sgt;
    return {
      name,
      syDuty: Math.round(dpp.syDuty * cpl),
      btfDuty: Math.round(dpp.btfDuty * fltTotal),
      ntfDuty: Math.round(dpp.ntfDuty * fltTotal),
      morning: Math.round(dpp.morning * fltTotal),
      afternoon: Math.round(dpp.afternoon * fltTotal),
      night: Math.round(dpp.night * fltTotal),
      reception: Math.round(dpp.reception * fltTotal),
      airfield: Math.round(dpp.airfield * fltTotal),
    };
  };

  const fltRows = [
    getFltRow('MECHANICS FLT', manpower.mechCpl, manpower.mechSgt),
    getFltRow('AVIONICS FLT', manpower.aviCpl, manpower.aviSgt),
    getFltRow('GCS FLT', manpower.gcsCpl, manpower.gcsSgt),
    getFltRow('ADMIN FLT', manpower.adminCpl, manpower.adminSgt),
  ];


  const InputTD = ({ val, onChange }: { val: number; onChange: (val: number) => void }) => (
    <input 
      type="number" 
      value={val === 0 ? '' : val} 
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full text-center bg-transparent outline-none font-bold text-slate-800 dark:text-slate-200"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm overflow-y-auto sm:p-6 sm:justify-center sm:items-center animate-fadeIn">
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Duty Ratio Matrix Settings
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                isSaved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
            <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black underline underline-offset-4 text-slate-800 dark:text-slate-100">All Duties</h3>
            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">155 UASU BAF</h4>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* TOTAL DUTY TABLE */}
            <div className="w-full md:w-auto">
              <h4 className="text-center font-bold text-sm underline mb-2 text-slate-800 dark:text-slate-200">TOTAL DUTY</h4>
              <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full md:w-64 shadow-sm">
                <thead>
                  <tr>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Duty Name</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Sy Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.syDuty} onChange={v => setTotalDuty({...totalDuty, syDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">BTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.btfDuty} onChange={v => setTotalDuty({...totalDuty, btfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">NTF Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.ntfDuty} onChange={v => setTotalDuty({...totalDuty, ntfDuty: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Morning</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacMorning} onChange={v => setTotalDuty({...totalDuty, idacMorning: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Afternoon</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacAfternoon} onChange={v => setTotalDuty({...totalDuty, idacAfternoon: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">IDAC Night</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.idacNight} onChange={v => setTotalDuty({...totalDuty, idacNight: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Reception</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.reception} onChange={v => setTotalDuty({...totalDuty, reception: v})} /></td></tr>
                  <tr><td className="border border-black dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300">Airfield Duty</td><td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={totalDuty.airfieldDuty} onChange={v => setTotalDuty({...totalDuty, airfieldDuty: v})} /></td></tr>
                </tbody>
              </table>
            </div>

            {/* EFFECTIVE MANPOWER TABLE */}
            <div className="w-full md:w-auto">
              <h4 className="text-center font-bold text-sm underline mb-2 text-slate-800 dark:text-slate-200">EFFECTIVE MANPOWER</h4>
              <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-full md:w-auto shadow-sm">
                <thead>
                  <tr>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Flight</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Sgt</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Cpl & Below</th>
                    <th className="border border-black dark:border-slate-600 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-700 dark:text-slate-300">Mech</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.mechSgt} onChange={v => setManpower({...manpower, mechSgt: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.mechCpl} onChange={v => setManpower({...manpower, mechCpl: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">{getFltTotal(manpower.mechSgt, manpower.mechCpl)}</td>
                  </tr>
                  <tr>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-700 dark:text-slate-300">Avi</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.aviSgt} onChange={v => setManpower({...manpower, aviSgt: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.aviCpl} onChange={v => setManpower({...manpower, aviCpl: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">{getFltTotal(manpower.aviSgt, manpower.aviCpl)}</td>
                  </tr>
                  <tr>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-700 dark:text-slate-300">GCS</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.gcsSgt} onChange={v => setManpower({...manpower, gcsSgt: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.gcsCpl} onChange={v => setManpower({...manpower, gcsCpl: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">{getFltTotal(manpower.gcsSgt, manpower.gcsCpl)}</td>
                  </tr>
                  <tr>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-700 dark:text-slate-300">Admin</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.adminSgt} onChange={v => setManpower({...manpower, adminSgt: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20"><InputTD val={manpower.adminCpl} onChange={v => setManpower({...manpower, adminCpl: v})} /></td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">{getFltTotal(manpower.adminSgt, manpower.adminCpl)}</td>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-800 dark:text-slate-100">Total</td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-800 dark:text-slate-100">{totalSgt}</td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-800 dark:text-slate-100">{totalCpl}</td>
                    <td className="border border-black dark:border-slate-600 px-3 py-1.5 text-center text-slate-800 dark:text-slate-100">{totalAll}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DISTRIBUTION AS PER MANPOWER */}
          <div className="w-full overflow-x-auto mt-8">
            <h4 className="text-center font-bold text-sm underline mb-1 text-slate-800 dark:text-slate-200">DISTRIBUTION AS PER MANPOWER</h4>
            <h5 className="text-center font-bold text-xs underline mb-3 text-slate-600 dark:text-slate-400">FORMULA</h5>
            <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-[10px] w-full shadow-sm text-center">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5 text-sm" rowSpan={3}>DUTY PER PERSON</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Security Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Base Taskforce Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Najirpara Taskforce Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" colSpan={3}>IDA Center</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Reception</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Airfield Duty</th>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Morning</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Afternoon</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Night</th>
                </tr>
                <tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Sy Duty ÷ Total Cpl & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total BTF Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total NTF Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Morning Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Afternoon Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Night Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Reception Duty ÷ Total Sgt & Below</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Total Airfield Duty ÷ Total Sgt & Below</td>
                </tr>
              </thead>
              <tbody>
                <tr className="font-mono text-sm text-slate-800 dark:text-slate-200">
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5"></td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.syDuty.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.btfDuty.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.ntfDuty.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.morning.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.afternoon.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.night.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.reception.toFixed(2)}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{dpp.airfield.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DISTRIBUTION AS PER FLIGHT */}
          <div className="w-full overflow-x-auto mt-8 pb-8">
            <h4 className="text-center font-bold text-sm underline mb-1 text-slate-800 dark:text-slate-200">DISTRIBUTION AS PER FLIGHT</h4>
            <h5 className="text-center font-bold text-xs underline mb-3 text-slate-600 dark:text-slate-400">FORMULA</h5>
            <table className="border-collapse border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-[10px] w-full shadow-sm text-center">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5 text-sm" rowSpan={2}>DUTY PER FLIGHT</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Base Security Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Base Taskforce Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Nazirpara Taskforce Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" colSpan={3}>IDA Center Duty</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Reception</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1.5" rowSpan={2}>Airfield Duty</th>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold">
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Morning</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Afternoon</th>
                  <th className="border border-black dark:border-slate-600 px-2 py-1">Night</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <td className="border border-black dark:border-slate-600 px-2 py-2"></td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Sy Duty x Total Cpl & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person BTF Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person NTF Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Morning Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Afternoon Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Night Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person Reception Duty x Total Sgt & Below of Flight</td>
                  <td className="border border-black dark:border-slate-600 px-1 py-2">Per Person AFLD Duty x Total Sgt & Below of Flight</td>
                </tr>
                {fltRows.map((row, idx) => (
                  <tr key={idx} className="font-mono text-sm text-slate-800 dark:text-slate-200">
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5 font-bold text-left font-sans">{row.name}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.syDuty}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.btfDuty}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.ntfDuty}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.morning}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.afternoon}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.night}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.reception}</td>
                    <td className="border border-black dark:border-slate-600 px-2 py-1.5">{row.airfield}</td>
                  </tr>
                ))}
                <tr className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100">
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5 text-left font-sans">TOTAL DUTY</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.syDuty}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.btfDuty}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.ntfDuty}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.idacMorning}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.idacAfternoon}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.idacNight}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.reception}</td>
                  <td className="border border-black dark:border-slate-600 px-2 py-1.5">{totalDuty.airfieldDuty}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};
