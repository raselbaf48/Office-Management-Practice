const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';

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

export interface DutyRatioConfigPanelProps {
  activeTab?: 'DUTY_DISTRIBUTION' | 'MANPOWER' | 'TOTAL_DUTY';
}

export const DutyRatioConfigPanel: React.FC<DutyRatioConfigPanelProps> = ({ activeTab }) => {
  const [totalDuty, setTotalDuty] = useState(() => {
    const savedDuty = localStorage.getItem('baf_duty_distribution_total_duty');
    return savedDuty ? JSON.parse(savedDuty) : DEFAULT_TOTAL_DUTY;
  });
  
  const [manpower, setManpower] = useState(() => {
    const savedManpower = localStorage.getItem('baf_duty_distribution_manpower');
    return savedManpower ? JSON.parse(savedManpower) : DEFAULT_MANPOWER;
  });

  const [customFltDist, setCustomFltDist] = useState<Record<string, Record<string, number | undefined>>>(() => {
    const saved = localStorage.getItem('baf_duty_distribution_custom_flt');
    return saved ? JSON.parse(saved) : {};
  });

  const [viewDetailsIdx, setViewDetailsIdx] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_total_duty', JSON.stringify(totalDuty));
    localStorage.setItem('baf_duty_distribution_manpower', JSON.stringify(manpower));
    localStorage.setItem('baf_duty_distribution_custom_flt', JSON.stringify(customFltDist));
  }, [totalDuty, manpower, customFltDist]);

  const totalSgt = manpower.mechSgt + manpower.aviSgt + manpower.gcsSgt + manpower.adminSgt;
  const totalCpl = manpower.mechCpl + manpower.aviCpl + manpower.gcsCpl + manpower.adminCpl;
  const totalSgtAndBelow = totalSgt + totalCpl;

  const airfieldCapacities = [
    manpower.mechSgt + manpower.mechCpl,
    manpower.aviSgt + manpower.aviCpl,
    manpower.gcsSgt + manpower.gcsCpl,
    0 // Admin excluded
  ];
  
  const airfieldCapableSgtAndBelow = airfieldCapacities.reduce((a, b) => a + b, 0);

  const dpp = {
    syDuty: totalCpl > 0 ? totalDuty.syDuty / totalCpl : 0,
    btfDuty: totalSgtAndBelow > 0 ? totalDuty.btfDuty / totalSgtAndBelow : 0,
    ntfDuty: totalSgtAndBelow > 0 ? totalDuty.ntfDuty / totalSgtAndBelow : 0,
    morning: totalSgtAndBelow > 0 ? totalDuty.idacMorning / totalSgtAndBelow : 0,
    afternoon: totalSgtAndBelow > 0 ? totalDuty.idacAfternoon / totalSgtAndBelow : 0,
    night: totalSgtAndBelow > 0 ? totalDuty.idacNight / totalSgtAndBelow : 0,
    reception: totalSgtAndBelow > 0 ? totalDuty.reception / totalSgtAndBelow : 0,
    airfield: airfieldCapableSgtAndBelow > 0 ? totalDuty.airfieldDuty / airfieldCapableSgtAndBelow : 0,
  };

  // Use Largest Remainder Method (LRM) to perfectly distribute targets without rounding mismatch
  const getLrmDistribution = (target: number, capacities: number[]) => {
    const totalCapacity = capacities.reduce((sum, cap) => sum + cap, 0);
    if (totalCapacity === 0) return capacities.map(() => 0);

    const exacts = capacities.map(c => (c / totalCapacity) * target);
    const results = exacts.map(e => Math.floor(e));
    const remainders = exacts.map((e, i) => ({ index: i, rem: e - Math.floor(e) }));
    
    // Sort by largest remainder descending
    remainders.sort((a, b) => b.rem - a.rem);

    const currentSum = results.reduce((a, b) => a + b, 0);
    const shortfall = target - currentSum;
    
    // Distribute the shortfall to the ones with largest fractional parts
    for (let i = 0; i < shortfall && i < remainders.length; i++) {
      results[remainders[i].index]++;
    }
    return results;
  };

  const cplCapacities = [manpower.mechCpl, manpower.aviCpl, manpower.gcsCpl, manpower.adminCpl];
  const sgtAndBelowCapacities = [
    manpower.mechSgt + manpower.mechCpl,
    manpower.aviSgt + manpower.aviCpl,
    manpower.gcsSgt + manpower.gcsCpl,
    manpower.adminSgt + manpower.adminCpl
  ];

  const syDist = getLrmDistribution(totalDuty.syDuty, cplCapacities);
  const btfDist = getLrmDistribution(totalDuty.btfDuty, sgtAndBelowCapacities);
  const ntfDist = getLrmDistribution(totalDuty.ntfDuty, sgtAndBelowCapacities);
  const morningDist = getLrmDistribution(totalDuty.idacMorning, sgtAndBelowCapacities);
  const afternoonDist = getLrmDistribution(totalDuty.idacAfternoon, sgtAndBelowCapacities);
  const nightDist = getLrmDistribution(totalDuty.idacNight, sgtAndBelowCapacities);
  const receptionDist = getLrmDistribution(totalDuty.reception, sgtAndBelowCapacities);
  const airfieldDist = getLrmDistribution(totalDuty.airfieldDuty, airfieldCapacities);

  const flightNames = ['MECHANICS FLT', 'AVIONICS FLT', 'GCS FLT', 'ADMIN FLT'];
  
  const exactValsArray = flightNames.map((name, idx) => ({
    syDuty: cplCapacities[idx] * dpp.syDuty,
    btfDuty: sgtAndBelowCapacities[idx] * dpp.btfDuty,
    ntfDuty: sgtAndBelowCapacities[idx] * dpp.ntfDuty,
    morning: sgtAndBelowCapacities[idx] * dpp.morning,
    afternoon: sgtAndBelowCapacities[idx] * dpp.afternoon,
    night: sgtAndBelowCapacities[idx] * dpp.night,
    reception: sgtAndBelowCapacities[idx] * dpp.reception,
    airfield: airfieldCapacities[idx] * dpp.airfield,
  }));

  const fltRows = flightNames.map((name, idx) => {
    const autoVals = {
      syDuty: syDist[idx],
      btfDuty: btfDist[idx],
      ntfDuty: ntfDist[idx],
      morning: morningDist[idx],
      afternoon: afternoonDist[idx],
      night: nightDist[idx],
      reception: receptionDist[idx],
      airfield: airfieldDist[idx],
    };
    
    const custom = customFltDist[name] || {};
    
    return {
      name,
      autoVals,
      exactVals: exactValsArray[idx],
      syDuty: custom.syDuty !== undefined ? custom.syDuty : autoVals.syDuty,
      btfDuty: custom.btfDuty !== undefined ? custom.btfDuty : autoVals.btfDuty,
      ntfDuty: custom.ntfDuty !== undefined ? custom.ntfDuty : autoVals.ntfDuty,
      morning: custom.morning !== undefined ? custom.morning : autoVals.morning,
      afternoon: custom.afternoon !== undefined ? custom.afternoon : autoVals.afternoon,
      night: custom.night !== undefined ? custom.night : autoVals.night,
      reception: custom.reception !== undefined ? custom.reception : autoVals.reception,
      airfield: custom.airfield !== undefined ? custom.airfield : autoVals.airfield,
    };
  });

  const sums = fltRows.reduce((acc, row) => {
    acc.syDuty += row.syDuty;
    acc.btfDuty += row.btfDuty;
    acc.ntfDuty += row.ntfDuty;
    acc.morning += row.morning;
    acc.afternoon += row.afternoon;
    acc.night += row.night;
    acc.reception += row.reception;
    acc.airfield += row.airfield;
    return acc;
  }, { syDuty: 0, btfDuty: 0, ntfDuty: 0, morning: 0, afternoon: 0, night: 0, reception: 0, airfield: 0 });

  const warnings = {
    syDuty: sums.syDuty !== totalDuty.syDuty,
    btfDuty: sums.btfDuty !== totalDuty.btfDuty,
    ntfDuty: sums.ntfDuty !== totalDuty.ntfDuty,
    morning: sums.morning !== totalDuty.idacMorning,
    afternoon: sums.afternoon !== totalDuty.idacAfternoon,
    night: sums.night !== totalDuty.idacNight,
    reception: sums.reception !== totalDuty.reception,
    airfield: sums.airfield !== totalDuty.airfieldDuty,
  };

  const hasAnyWarning = Object.values(warnings).some(v => v);

  const handleCustomChange = (flightName: string, field: string, value: number | undefined) => {
    setCustomFltDist(prev => ({
      ...prev,
      [flightName]: {
        ...(prev[flightName] || {}),
        [field]: value
      }
    }));
  };

  const resetCustomDistributions = () => {
    setCustomFltDist({});
  };

  const InputTD = ({ val, onChange }: { val: number, onChange: (v: number) => void }) => (
    <input 
      type="number" 
      value={val === 0 ? '' : val} 
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-full text-center bg-transparent focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
    />
  );

  const FltInput = ({ flightName, field, val, autoVal, disabled = false }: { flightName: string, field: string, val: number, autoVal: number, disabled?: boolean }) => (
    <input 
      type="number"
      value={val === 0 ? '' : val}
      disabled={disabled}
      onChange={(e) => {
        const valStr = e.target.value;
        if (valStr === '') {
          handleCustomChange(flightName, field, undefined);
        } else {
          handleCustomChange(flightName, field, parseInt(valStr) || 0);
        }
      }}
      placeholder={autoVal.toString()}
      className={\`w-full text-center bg-transparent focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 \${disabled ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-slate-900 dark:text-slate-100'} py-1\`}
    />
  );

  const ThCell = ({ children, rowSpan, colSpan, className = '' }: any) => (
    <th className={\`border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold \${className}\`} rowSpan={rowSpan} colSpan={colSpan}>
      {children}
    </th>
  );

  const TdCell = ({ children, warning = false, className = '' }: any) => (
    <td className={\`border border-slate-400 dark:border-slate-700 px-0 py-0 \${warning ? 'bg-red-100 dark:bg-red-900/40' : ''} \${className}\`}>
      {children}
    </td>
  );

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 min-h-max overflow-auto text-sm font-sans relative" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Main Headers */}
      <div className="text-center mb-6">
        <div className="font-bold underline text-lg">All Duties</div>
        <div className="font-bold underline text-lg">155 UASU BAF</div>
      </div>

      {/* Conditionally rendered Top Tables Flex */}
      <div className="flex flex-col md:flex-row justify-center gap-12 mb-8">
        
        {(!activeTab || activeTab === 'TOTAL_DUTY') && (
          <div>
            <div className="font-bold underline text-center mb-1">TOTAL DUTY</div>
            <table className="border-collapse border border-slate-400 dark:border-slate-700 text-center bg-white dark:bg-slate-900" style={{ minWidth: '200px' }}>
              <thead>
                <tr>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Duty Name</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">Sy Duty</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.syDuty} onChange={(v) => setTotalDuty({...totalDuty, syDuty: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">BTF Duty</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.btfDuty} onChange={(v) => setTotalDuty({...totalDuty, btfDuty: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">NTF Duty</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.ntfDuty} onChange={(v) => setTotalDuty({...totalDuty, ntfDuty: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">IDAC Morning</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.idacMorning} onChange={(v) => setTotalDuty({...totalDuty, idacMorning: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">IDAC Afternoon</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.idacAfternoon} onChange={(v) => setTotalDuty({...totalDuty, idacAfternoon: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">IDAC Night</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.idacNight} onChange={(v) => setTotalDuty({...totalDuty, idacNight: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">Receiption</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.reception} onChange={(v) => setTotalDuty({...totalDuty, reception: v})} /></td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">Airfield Duty</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={totalDuty.airfieldDuty} onChange={(v) => setTotalDuty({...totalDuty, airfieldDuty: v})} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {(!activeTab || activeTab === 'MANPOWER') && (
          <div>
            <div className="font-bold underline text-center mb-1">EFFECTIVE MANPOWER</div>
            <table className="border-collapse border border-slate-400 dark:border-slate-700 text-center bg-white dark:bg-slate-900" style={{ minWidth: '300px' }}>
              <thead>
                <tr>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Sgt</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Cpl & Below</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">Mech</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.mechSgt} onChange={(v) => setManpower({...manpower, mechSgt: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.mechCpl} onChange={(v) => setManpower({...manpower, mechCpl: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{manpower.mechSgt + manpower.mechCpl}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">Avi</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.aviSgt} onChange={(v) => setManpower({...manpower, aviSgt: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.aviCpl} onChange={(v) => setManpower({...manpower, aviCpl: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{manpower.aviSgt + manpower.aviCpl}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">GCS</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.gcsSgt} onChange={(v) => setManpower({...manpower, gcsSgt: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.gcsCpl} onChange={(v) => setManpower({...manpower, gcsCpl: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{manpower.gcsSgt + manpower.gcsCpl}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">Admin</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.adminSgt} onChange={(v) => setManpower({...manpower, adminSgt: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-0 py-0"><InputTD val={manpower.adminCpl} onChange={(v) => setManpower({...manpower, adminCpl: v})} /></td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{manpower.adminSgt + manpower.adminCpl}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Total</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">{totalSgt}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">{totalCpl}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">{totalSgt + totalCpl}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(!activeTab || activeTab === 'DUTY_DISTRIBUTION') && (
        <>
          {/* DISTRIBUTION AS PER MANPOWER */}
          <div className="mb-8 overflow-x-auto">
            <div className="text-center mb-2">
              <div className="font-bold underline text-sm mb-0.5">DISTRIBUTION AS PER MANPOWER</div>
              <div className="underline text-sm">FORMULA</div>
            </div>
            <table className="border-collapse border border-slate-400 dark:border-slate-700 text-center w-full min-w-[900px] text-[13px] bg-white dark:bg-slate-900">
              <thead>
                <tr>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold" rowSpan={2}>Security Duty</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold" rowSpan={2}>Base Taskforce<br/>Duty</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold" rowSpan={2}>Najirpara<br/>Taskforce Duty</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold" colSpan={3}>IDA Center</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold" rowSpan={2}>Receiption</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-2 font-bold" rowSpan={2}>Airfield Duty</th>
                </tr>
                <tr>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Morning</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Afternoon</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold">Night</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[10px]">
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Sy Duty ÷ Total<br/>Cpl & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total BTF Duty ÷<br/>Total Sgt & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total NTF Duty ÷ Total<br/>Sgt & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Morning Duty ÷<br/>Total Sgt & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Afternoon Duty ÷<br/>Total Sgt & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Night Duty ÷ Total<br/>Sgt & Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Receiption<br/>Duty ÷ Total Sgt &<br/>Below</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-1 py-1">Total Airfield Duty ÷ Total<br/>Sgt & Below (Excl Admin)</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.syDuty.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.btfDuty.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.ntfDuty.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.morning.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.afternoon.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.night.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.reception.toFixed(2)}</td>
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1">{dpp.airfield.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DISTRIBUTION AS PER FLIGHT */}
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-col items-center mb-4">
              <div className="font-bold underline text-sm mb-0.5">DISTRIBUTION AS PER FLIGHT</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Values auto-generate intelligently to exactly match the target total. You can edit cells manually. Delete manual values to revert to auto.
              </div>
              
              {hasAnyWarning && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md text-xs font-bold mb-2 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>Warning: Total duties assigned across flights doesn't match Requirements. Please adjust values.</span>
                </div>
              )}
            </div>

            <table className="border-collapse border border-slate-400 dark:border-slate-700 text-center w-full min-w-[900px] text-[13px] bg-white dark:bg-slate-900">
              <thead>
                <tr>
                  <ThCell rowSpan={3} className="w-40 text-left"><div className="text-center">DUTY PER FLIGHT</div></ThCell>
                  <ThCell rowSpan={2}>Base Security Duty</ThCell>
                  <ThCell rowSpan={2}>Base Taskforce Duty</ThCell>
                  <ThCell rowSpan={2}>Nazirpara Taskforce<br/>Duty</ThCell>
                  <ThCell colSpan={3}>IDA Center Duty</ThCell>
                  <ThCell rowSpan={2}>Receiption</ThCell>
                  <ThCell rowSpan={2}>Airfield Duty</ThCell>
                </tr>
                <tr>
                  <ThCell>Morning</ThCell>
                  <ThCell>Afternoon</ThCell>
                  <ThCell>Night</ThCell>
                </tr>
                <tr className="text-[10px]">
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person Sy Duty x Total<br/>Cpl & Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person BTF Duty x Total<br/>Sgt & Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person NTF Duty x Total<br/>Sgt & Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person Morning<br/>Duty x Total Sgt &<br/>Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person Afternoon<br/>Duty x Total Sgt &<br/>Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person Night Duty x<br/>Total Sgt & Below of<br/>Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person Receiption Duty x<br/>Total Sgt & Below of Flight</th>
                  <th className="border border-slate-400 dark:border-slate-700 px-1 py-1 font-normal bg-slate-50 dark:bg-slate-800">Per Person AFLD Duty x<br/>Total Sgt & Below of<br/>Flight</th>
                </tr>
              </thead>
              <tbody>
                {fltRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 font-bold text-left bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <span>{row.name}</span>
                        <button 
                          onClick={() => setViewDetailsIdx(idx)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
                          title="View Exact Ratios"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <TdCell warning={customFltDist[row.name]?.syDuty !== undefined && warnings.syDuty}><FltInput flightName={row.name} field="syDuty" val={row.syDuty} autoVal={row.autoVals.syDuty} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.btfDuty !== undefined && warnings.btfDuty}><FltInput flightName={row.name} field="btfDuty" val={row.btfDuty} autoVal={row.autoVals.btfDuty} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.ntfDuty !== undefined && warnings.ntfDuty}><FltInput flightName={row.name} field="ntfDuty" val={row.ntfDuty} autoVal={row.autoVals.ntfDuty} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.morning !== undefined && warnings.morning}><FltInput flightName={row.name} field="morning" val={row.morning} autoVal={row.autoVals.morning} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.afternoon !== undefined && warnings.afternoon}><FltInput flightName={row.name} field="afternoon" val={row.afternoon} autoVal={row.autoVals.afternoon} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.night !== undefined && warnings.night}><FltInput flightName={row.name} field="night" val={row.night} autoVal={row.autoVals.night} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.reception !== undefined && warnings.reception}><FltInput flightName={row.name} field="reception" val={row.reception} autoVal={row.autoVals.reception} /></TdCell>
                    <TdCell warning={customFltDist[row.name]?.airfield !== undefined && warnings.airfield}>
                      {row.name === 'ADMIN FLT' ? (
                        <div className="w-full text-center text-slate-400 bg-slate-100 dark:bg-slate-800/50 py-1">N/A</div>
                      ) : (
                        <FltInput flightName={row.name} field="airfield" val={row.airfield} autoVal={row.autoVals.airfield} />
                      )}
                    </TdCell>
                  </tr>
                ))}
                
                <tr className="font-bold bg-slate-100 dark:bg-slate-800">
                  <td className="border border-slate-400 dark:border-slate-700 px-2 py-1 text-left">TOTAL</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.syDuty ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.syDuty}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.btfDuty ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.btfDuty}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.ntfDuty ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.ntfDuty}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.morning ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.morning}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.afternoon ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.afternoon}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.night ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.night}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.reception ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.reception}</td>
                  <td className={\`border border-slate-400 dark:border-slate-700 px-2 py-1 \${warnings.airfield ? 'text-red-600 dark:text-red-400' : ''}\`}>{sums.airfield}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="flex justify-end mt-2">
              <button 
                onClick={resetCustomDistributions}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Reset All Manual Edits to Auto
              </button>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {viewDetailsIdx !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                {fltRows[viewDetailsIdx].name} - Duty Ratio Breakdown
              </h3>
              <button 
                onClick={() => setViewDetailsIdx(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Duty Type</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 text-right">Exact Ratio (Formula)</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 text-right">Auto Rounded</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 text-right">Current Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Security Duty', key: 'syDuty' },
                    { label: 'Base Taskforce Duty', key: 'btfDuty' },
                    { label: 'Nazirpara Taskforce Duty', key: 'ntfDuty' },
                    { label: 'IDA Morning', key: 'morning' },
                    { label: 'IDA Afternoon', key: 'afternoon' },
                    { label: 'IDA Night', key: 'night' },
                    { label: 'Reception', key: 'reception' },
                    { label: 'Airfield Duty', key: 'airfield' },
                  ].map(({ label, key }) => {
                    const row = fltRows[viewDetailsIdx];
                    const exact = row.exactVals[key as keyof typeof row.exactVals];
                    const auto = row.autoVals[key as keyof typeof row.autoVals];
                    const current = row[key as keyof typeof row.autoVals];
                    
                    if (row.name === 'ADMIN FLT' && key === 'airfield') return null;
                    
                    const isManual = customFltDist[row.name]?.[key] !== undefined;
                    
                    return (
                      <tr key={key} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">{label}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-right text-slate-600 dark:text-slate-400">
                          {exact.toFixed(4)}
                        </td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-right">{auto}</td>
                        <td className={\`border border-slate-300 dark:border-slate-700 p-2 text-right font-bold \${isManual ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' : ''}\`}>
                          {current}
                          {isManual && <span className="text-xs ml-1 font-normal block text-blue-500">(Manual)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                <p><strong>Exact Ratio:</strong> The mathematically accurate distribution before rounding.</p>
                <p><strong>Auto Rounded:</strong> The LRM algorithm applied distribution matching the exact target sum.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
`
fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
