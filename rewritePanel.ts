import fs from 'fs';

const content = `import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

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

export const DutyRatioConfigPanel: React.FC = () => {
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
    // Custom event to trigger matrix reload if needed
    window.dispatchEvent(new Event('dutyRatiosUpdated'));
  };

  // Derived calculations
  const totalSgt = manpower.mechSgt + manpower.aviSgt + manpower.gcsSgt + manpower.adminSgt;
  const totalCpl = manpower.mechCpl + manpower.aviCpl + manpower.gcsCpl + manpower.adminCpl;

  const dpp = {
    syDuty: totalCpl > 0 ? totalDuty.syDuty / totalCpl : 0,
    btfDuty: totalSgt > 0 ? totalDuty.btfDuty / totalSgt : 0,
    ntfDuty: totalSgt > 0 ? totalDuty.ntfDuty / totalSgt : 0,
    morning: totalSgt > 0 ? totalDuty.idacMorning / totalSgt : 0,
    afternoon: totalSgt > 0 ? totalDuty.idacAfternoon / totalSgt : 0,
    night: totalSgt > 0 ? totalDuty.idacNight / totalSgt : 0,
    reception: totalSgt > 0 ? totalDuty.reception / totalSgt : 0,
    airfield: totalSgt > 0 ? totalDuty.airfieldDuty / totalSgt : 0,
  };

  const getFltData = (name: string, sgt: number, cpl: number) => ({
    name,
    syDuty: Math.round(dpp.syDuty * cpl),
    btfDuty: Math.round(dpp.btfDuty * sgt),
    ntfDuty: Math.round(dpp.ntfDuty * sgt),
    morning: Math.round(dpp.morning * sgt),
    afternoon: Math.round(dpp.afternoon * sgt),
    night: Math.round(dpp.night * sgt),
    reception: Math.round(dpp.reception * sgt),
    airfield: Math.round(dpp.airfield * sgt),
  });

  const fltRows = [
    getFltData('MECHANICS FLT', manpower.mechSgt, manpower.mechCpl),
    getFltData('AVIONICS FLT', manpower.aviSgt, manpower.aviCpl),
    getFltData('GCS FLT', manpower.gcsSgt, manpower.gcsCpl),
    getFltData('ADMIN FLT', manpower.adminSgt, manpower.adminCpl),
  ];

  // Helper for inputs to look like plain text
  const InputTD = ({ val, onChange }: { val: number, onChange: (v: number) => void }) => (
    <input 
      type="number" 
      value={val === 0 ? '' : val} 
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full text-center bg-transparent focus:outline-none focus:bg-slate-100"
    />
  );

  return (
    <div className="bg-white text-black p-4 md:p-8 min-h-max overflow-auto text-sm font-sans relative" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Save Button Floating */}
      <button 
        onClick={handleSave}
        className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1.5 bg-black text-white text-xs font-bold rounded shadow-md hover:bg-gray-800 transition-colors"
      >
        {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
      </button>

      {/* Main Headers */}
      <div className="text-center mb-6">
        <div className="font-bold underline text-lg">All Duties</div>
        <div className="font-bold underline text-lg">155 UASU BAF</div>
      </div>

      {/* Top Tables Flex */}
      <div className="flex flex-col md:flex-row justify-center gap-12 mb-8">
        
        {/* TOTAL DUTY TABLE */}
        <div>
          <div className="font-bold underline text-center mb-1">TOTAL DUTY</div>
          <table className="border-collapse border border-black text-center" style={{ minWidth: '200px' }}>
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Duty Name</th>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 text-left">Sy Duty</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.syDuty} onChange={(v) => setTotalDuty({...totalDuty, syDuty: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">BTF Duty</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.btfDuty} onChange={(v) => setTotalDuty({...totalDuty, btfDuty: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">NTF Duty</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.ntfDuty} onChange={(v) => setTotalDuty({...totalDuty, ntfDuty: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">IDAC Morning</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.idacMorning} onChange={(v) => setTotalDuty({...totalDuty, idacMorning: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">IDAC Afternoon</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.idacAfternoon} onChange={(v) => setTotalDuty({...totalDuty, idacAfternoon: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">IDAC Night</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.idacNight} onChange={(v) => setTotalDuty({...totalDuty, idacNight: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">Receiption</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.reception} onChange={(v) => setTotalDuty({...totalDuty, reception: v})} /></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-left">Airfield Duty</td>
                <td className="border border-black px-0 py-0"><InputTD val={totalDuty.airfieldDuty} onChange={(v) => setTotalDuty({...totalDuty, airfieldDuty: v})} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* EFFECTIVE MANPOWER TABLE */}
        <div>
          <div className="font-bold underline text-center mb-1">EFFECTIVE MANPOWER</div>
          <table className="border-collapse border border-black text-center" style={{ minWidth: '300px' }}>
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Flight</th>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Sgt</th>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Cpl & Below</th>
                <th className="border border-black px-2 py-1 font-bold bg-white text-black">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1">Mech</td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.mechSgt} onChange={(v) => setManpower({...manpower, mechSgt: v})} /></td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.mechCpl} onChange={(v) => setManpower({...manpower, mechCpl: v})} /></td>
                <td className="border border-black px-2 py-1">{manpower.mechSgt + manpower.mechCpl}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">Avi</td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.aviSgt} onChange={(v) => setManpower({...manpower, aviSgt: v})} /></td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.aviCpl} onChange={(v) => setManpower({...manpower, aviCpl: v})} /></td>
                <td className="border border-black px-2 py-1">{manpower.aviSgt + manpower.aviCpl}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">GCS</td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.gcsSgt} onChange={(v) => setManpower({...manpower, gcsSgt: v})} /></td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.gcsCpl} onChange={(v) => setManpower({...manpower, gcsCpl: v})} /></td>
                <td className="border border-black px-2 py-1">{manpower.gcsSgt + manpower.gcsCpl}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">Admin</td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.adminSgt} onChange={(v) => setManpower({...manpower, adminSgt: v})} /></td>
                <td className="border border-black px-0 py-0"><InputTD val={manpower.adminCpl} onChange={(v) => setManpower({...manpower, adminCpl: v})} /></td>
                <td className="border border-black px-2 py-1">{manpower.adminSgt + manpower.adminCpl}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">Total</td>
                <td className="border border-black px-2 py-1">{totalSgt}</td>
                <td className="border border-black px-2 py-1">{totalCpl}</td>
                <td className="border border-black px-2 py-1">{totalSgt + totalCpl}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* DISTRIBUTION AS PER MANPOWER */}
      <div className="mb-8 overflow-x-auto">
        <div className="text-center mb-2">
          <div className="font-bold underline text-sm mb-0.5">DISTRIBUTION AS PER MANPOWER</div>
          <div className="underline text-sm">FORMULA</div>
        </div>
        <table className="border-collapse border border-black text-center w-full min-w-[900px] text-[13px]">
          <thead>
            <tr>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black w-32" rowSpan={2}>DUTY PER PERSON</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Security Duty</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Base Taskforce<br/>Duty</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Najirpara<br/>Taskforce Duty</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black" colSpan={3}>IDA Center</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Receiption</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Airfield Duty</th>
            </tr>
            <tr>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Morning</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Afternoon</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Night</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[10px]">
              <td className="border border-black px-1 py-1 bg-white"></td>
              <td className="border border-black px-1 py-1">Total Sy Duty ÷ Total<br/>Cpl & Below</td>
              <td className="border border-black px-1 py-1">Total BTF Duty ÷<br/>Total Sgt & Below</td>
              <td className="border border-black px-1 py-1">Total NTF Duty ÷ Total<br/>Sgt & Below</td>
              <td className="border border-black px-1 py-1">Total Morning Duty ÷<br/>Total Sgt & Below</td>
              <td className="border border-black px-1 py-1">Total Afternoon Duty ÷<br/>Total Sgt & Below</td>
              <td className="border border-black px-1 py-1">Total Night Duty ÷ Total<br/>Sgt & Below</td>
              <td className="border border-black px-1 py-1">Total Receiption<br/>Duty ÷ Total Sgt &<br/>Below</td>
              <td className="border border-black px-1 py-1">Total Airfield Duty ÷ Total<br/>Sgt & Below</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 bg-white"></td>
              <td className="border border-black px-2 py-1">{dpp.syDuty.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.btfDuty.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.ntfDuty.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.morning.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.afternoon.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.night.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.reception.toFixed(2)}</td>
              <td className="border border-black px-2 py-1">{dpp.airfield.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DISTRIBUTION AS PER FLIGHT */}
      <div className="overflow-x-auto pb-4">
        <div className="text-center mb-2">
          <div className="font-bold underline text-sm mb-0.5">DISTRIBUTION AS PER FLIGHT</div>
          <div className="underline text-sm">FORMULA</div>
        </div>
        <table className="border-collapse border border-black text-center w-full min-w-[900px] text-[13px]">
          <thead>
            <tr>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black w-40 text-left" rowSpan={2}><div className="text-center">DUTY PER FLIGHT</div></th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Base Security Duty</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Base Taskforce Duty</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Nazirpara Taskforce<br/>Duty</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black" colSpan={3}>IDA Center Duty</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Receiption</th>
              <th className="border border-black px-2 py-2 font-bold bg-white text-black" rowSpan={2}>Airfield Duty</th>
            </tr>
            <tr>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Morning</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Afternoon</th>
              <th className="border border-black px-2 py-1 font-bold bg-white text-black">Night</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[10px]">
              <td className="border border-black px-1 py-1 bg-white"></td>
              <td className="border border-black px-1 py-1">Per Person Sy Duty x Total<br/>Cpl & Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person BTF Duty x Total<br/>Sgt & Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person NTF Duty x Total<br/>Sgt & Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person Morning<br/>Duty x Total Sgt &<br/>Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person Afternoon<br/>Duty x Total Sgt &<br/>Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person Night Duty x<br/>Total Sgt & Below of<br/>Flight</td>
              <td className="border border-black px-1 py-1">Per Person Receiption Duty x<br/>Total Sgt & Below of Flight</td>
              <td className="border border-black px-1 py-1">Per Person AFLD Duty x<br/>Total Sgt & Below of<br/>Flight</td>
            </tr>
            {fltRows.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-black px-2 py-1 font-bold text-left">{row.name}</td>
                <td className="border border-black px-2 py-1">{row.syDuty}</td>
                <td className="border border-black px-2 py-1">{row.btfDuty}</td>
                <td className="border border-black px-2 py-1">{row.ntfDuty}</td>
                <td className="border border-black px-2 py-1">{row.morning}</td>
                <td className="border border-black px-2 py-1">{row.afternoon}</td>
                <td className="border border-black px-2 py-1">{row.night}</td>
                <td className="border border-black px-2 py-1">{row.reception}</td>
                <td className="border border-black px-2 py-1">{row.airfield}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border border-black px-2 py-1 text-left">TOTAL DUTY</td>
              <td className="border border-black px-2 py-1">{totalDuty.syDuty}</td>
              <td className="border border-black px-2 py-1">{totalDuty.btfDuty}</td>
              <td className="border border-black px-2 py-1">{totalDuty.ntfDuty}</td>
              <td className="border border-black px-2 py-1">{totalDuty.idacMorning}</td>
              <td className="border border-black px-2 py-1">{totalDuty.idacAfternoon}</td>
              <td className="border border-black px-2 py-1">{totalDuty.idacNight}</td>
              <td className="border border-black px-2 py-1">{totalDuty.reception}</td>
              <td className="border border-black px-2 py-1">{totalDuty.airfieldDuty}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
`
fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', content);
