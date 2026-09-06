import React, { useMemo } from 'react';
import { DutyRatioTable } from '../data/officialDutyRatioMatrix';
import { FlightName } from '../types';
import { Printer, X, Download } from 'lucide-react';
import { exportDutyRatioDocx } from '../utils/docxExport';
import { DUTY_TYPE_MAP } from '../data/dutyTypes';

interface PrintableDutyRatioModalProps {
  matrix: DutyRatioTable[];
  selectedFlightFilter: FlightName | 'Overall';
  onClose: () => void;
}

export const PrintableDutyRatioModal: React.FC<PrintableDutyRatioModalProps> = ({
  matrix,
  selectedFlightFilter,
  onClose,
}) => {
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  const getPdfTitle = () => `Duty_Ratio_Matrix_Complete.pdf`;

  const handlePrint = () => {
    document.title = getPdfTitle();
    setTimeout(() => {
      window.print();
    }, 100);
  };
  
  // Get manpower from local storage as calculated by the main view
  const currentManpowerStr = localStorage.getItem('baf_duty_distribution_manpower');
  const currentManpower = currentManpowerStr ? JSON.parse(currentManpowerStr) : {
    mechSgt: 5, mechCpl: 6,
    aviSgt: 4, aviCpl: 3,
    gcsSgt: 5, gcsCpl: 6,
    adminSgt: 0, adminCpl: 1,
  };
  
  const totalSgt = currentManpower.mechSgt + currentManpower.aviSgt + currentManpower.gcsSgt + currentManpower.adminSgt;
  const totalCpl = currentManpower.mechCpl + currentManpower.aviCpl + currentManpower.gcsCpl + currentManpower.adminCpl;
  const totalSgtAndBelow = totalSgt + totalCpl;

  const calculatedMatrixDistributions = useMemo(() => {
    if (!matrix) return {};
    const result: Record<string, Record<string, { autoVal: number, exactVal: number }>> = {};
    
    // Tracker to balance pure ties across different duty types
    const tieBreakerTracker: Record<string, number> = {
      'Mechanics': 0, 'Avionics': 0, 'GCS': 0, 'Admin': 0
    };
    
    matrix.forEach(t => {
      const isSecurity = t.id === 'security_duty';
      const dutyTotal = t.totalRequiredMonth || 0;
      
      const flights = ['Mechanics', 'Avionics', 'GCS', 'Admin'];
      const flightPools: Record<string, number> = {};
      
      let actualPoolSize = 0;
      flights.forEach(fl => {
        let fltCpl = 0, fltSgt = 0;
        if (fl === 'Mechanics') { fltCpl = currentManpower.mechCpl; fltSgt = currentManpower.mechSgt; }
        if (fl === 'Avionics') { fltCpl = currentManpower.aviCpl; fltSgt = currentManpower.aviSgt; }
        if (fl === 'GCS') { fltCpl = currentManpower.gcsCpl; fltSgt = currentManpower.gcsSgt; }
        if (fl === 'Admin') { fltCpl = currentManpower.adminCpl; fltSgt = currentManpower.adminSgt; }
        
        let fltPool = isSecurity ? fltCpl : (fltCpl + fltSgt);
        if (t.eligibleFlights && !t.eligibleFlights.includes(fl as any)) {
          fltPool = 0;
        }
        flightPools[fl] = fltPool;
        actualPoolSize += fltPool;
      });

      if (dutyTotal === 0 || actualPoolSize === 0) {
        result[t.id] = flights.reduce((acc, fl) => ({ ...acc, [fl]: { autoVal: 0, exactVal: 0 } }), {});
        return;
      }

      const exactVals = flights.map(fl => {
        const exact = (flightPools[fl] / actualPoolSize) * dutyTotal;
        return {
          flight: fl,
          exact: exact,
          floor: Math.floor(exact),
          remainder: exact - Math.floor(exact)
        };
      });

      const allocated = exactVals.reduce((sum, item) => sum + item.floor, 0);
      const remaining = dutyTotal - allocated;

      const sortedForDistribution = [...exactVals]
        .filter(item => flightPools[item.flight] > 0)
        .sort((a, b) => {
        const diff = b.remainder - a.remainder;
        if (Math.abs(diff) > 1e-9) {
          return diff; // larger remainder first
        }
        const floorDiff = a.floor - b.floor;
        if (floorDiff !== 0) {
          return floorDiff; // tie breaker 1: lower total duty (floor) first
        }
        // tie breaker 2: alternate based on who has received fewer extra tie-breaker duties
        return tieBreakerTracker[a.flight] - tieBreakerTracker[b.flight];
      });

      for (let i = 0; i < remaining && i < sortedForDistribution.length; i++) {
        sortedForDistribution[i].floor += 1;
        // Record allocation to balance future pure ties
        tieBreakerTracker[sortedForDistribution[i].flight] += 1;
      }

      result[t.id] = {};
      exactVals.forEach(item => {
        result[t.id][item.flight] = { autoVal: item.floor, exactVal: item.exact };
      });
    });
    
    return result;
  }, [matrix, currentManpower]);

  const bgAlt = (idx: number) => idx % 2 === 1 ? '#f8fafc' : '#ffffff';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn print:static print:block print:h-auto print:overflow-visible overflow-y-auto" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0">
        <div className="flex items-center space-x-3 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-widest">
              OFFICIAL DUTY RATIO PRINT PREVIEW
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Use 'Save as PDF' or Print directly
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportDutyRatioDocx(matrix, `Duty_Ratio_Matrix_Complete.docx`)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export DOCX</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Official Export / Print</span>
          </button>
        </div>
      </div>

      {/* Printable Content Area */}
      <div className="flex-1 print:overflow-visible">
        <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-8 print:p-0 print:m-0 print:max-w-none text-black bg-white">
          
          {/* PAGE 1: Overview */}
          <div className="print:break-after-page min-h-[297mm]">
            {/* Title */}
            <div className="text-center font-bold underline mb-8 pt-4 text-sm uppercase">
              <p>All Duties</p>
              <p>155 UASU BAF</p>
            </div>
            
            {/* Two tables side by side */}
            <div className="flex justify-center gap-16 mb-8 text-[12px]">
              {/* TOTAL DUTY */}
              <div>
                <div className="font-bold underline text-center mb-1">TOTAL DUTY</div>
                <table className="border-collapse border border-black w-64 text-center">
                  <thead>
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <th className="border border-black font-bold p-1">Duty Name</th>
                      <th className="border border-black font-bold p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.filter(t => !t.isDisabled).map((t, i) => (
                      <tr key={t.id} style={{ backgroundColor: bgAlt(i) }}>
                        <td className="border border-black p-1 text-left px-2">{t.title}</td>
                        <td className="border border-black p-1">{t.totalRequiredMonth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* EFFECTIVE MANPOWER */}
              <div>
                <div className="font-bold underline text-center mb-1">EFFECTIVE MANPOWER</div>
                <table className="border-collapse border border-black w-80 text-center">
                  <thead>
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <th className="border border-black font-bold p-1">Flight</th>
                      <th className="border border-black font-bold p-1">Sgt</th>
                      <th className="border border-black font-bold p-1">Cpl & Below</th>
                      <th className="border border-black font-bold p-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Mech', 'Avi', 'GCS', 'Admin'].map((fl, i) => {
                      const sgtKey = fl === 'Mech' ? 'mechSgt' : fl === 'Avi' ? 'aviSgt' : fl === 'GCS' ? 'gcsSgt' : 'adminSgt';
                      const cplKey = fl === 'Mech' ? 'mechCpl' : fl === 'Avi' ? 'aviCpl' : fl === 'GCS' ? 'gcsCpl' : 'adminCpl';
                      const sgtCount = currentManpower[sgtKey as keyof typeof currentManpower];
                      const cplCount = currentManpower[cplKey as keyof typeof currentManpower];
                      return (
                        <tr key={fl} style={{ backgroundColor: bgAlt(i) }}>
                          <td className="border border-black p-1 text-center px-2">{fl}</td>
                          <td className="border border-black p-1">{sgtCount}</td>
                          <td className="border border-black p-1">{cplCount}</td>
                          <td className="border border-black p-1">{sgtCount + cplCount}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <td className="border border-black p-1 text-center px-2 font-bold">Total</td>
                      <td className="border border-black p-1 font-bold">{totalSgt}</td>
                      <td className="border border-black p-1 font-bold">{totalCpl}</td>
                      <td className="border border-black p-1 font-bold">{totalSgtAndBelow}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* DISTRIBUTION AS PER MANPOWER */}
            <div className="mb-8">
              <div className="text-center mb-1">
                <div className="font-bold underline text-[12px]">DISTRIBUTION AS PER MANPOWER</div>
                <div className="underline text-[12px]">FORMULA</div>
              </div>
              <table className="w-full border-collapse border border-black text-center text-[12px]">
                <thead>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <th rowSpan={2} className="border border-black font-bold p-1 align-middle w-32">DUTY PER PERSON</th>
                    {matrix.filter(t => !t.isDisabled).map(t => {
                      let title = t.title.split('(')[0].trim();
                      if (title === "IDAC MORNING") title = "Morning";
                      if (title === "IDAC AFTERNOON") title = "Afternoon";
                      if (title === "IDAC NIGHT") title = "Night";
                      
                      return (
                        <th key={t.id} className="border border-black font-bold p-1 px-2">
                          {title}
                        </th>
                      );
                    })}
                  </tr>
                  <tr className="text-[10px]" style={{ backgroundColor: '#ffffff' }}>
                    {matrix.filter(t => !t.isDisabled).map(t => {
                      const isSecurity = t.id === 'security_duty';
                      let targetRank = isSecurity ? 'Total Cpl & Below' : 'Total Sgt & Below';
                      const ranksToUse = t.eligibleRanks || DUTY_TYPE_MAP.get(t.dutyCode as any)?.eligibleRanks;
                      if (ranksToUse && ranksToUse.length > 0) {
                         const RANK_ORDER = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
                         const sorted = [...ranksToUse].sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
                         targetRank = 'Total ' + sorted[0] + ' & Below';
                      }
                      
                      let title = t.title.split('(')[0].trim();
                      if (title === "IDAC MORNING") title = "Morning Duty";
                      else if (title === "IDAC AFTERNOON") title = "Afternoon Duty";
                      else if (title === "IDAC NIGHT") title = "Night Duty";
                      
                      return (
                        <th key={t.id + 'formula'} className="border border-black p-1 font-normal">
                          Total {title} &divide;<br/>{targetRank}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <td className="border border-black font-bold p-1 text-center"></td>
                    {matrix.filter(t => !t.isDisabled).map(t => {
                      const isSecurity = t.id === 'security_duty';
                      let poolSize = 0;
                      ['Mechanics', 'Avionics', 'GCS', 'Admin'].forEach(fl => {
                        if (t.eligibleFlights && !t.eligibleFlights.includes(fl as any)) return;
                        
                        let fltCpl = 0, fltSgt = 0;
                        if (fl === 'Mechanics') { fltCpl = currentManpower.mechCpl; fltSgt = currentManpower.mechSgt; }
                        if (fl === 'Avionics') { fltCpl = currentManpower.aviCpl; fltSgt = currentManpower.aviSgt; }
                        if (fl === 'GCS') { fltCpl = currentManpower.gcsCpl; fltSgt = currentManpower.gcsSgt; }
                        if (fl === 'Admin') { fltCpl = currentManpower.adminCpl; fltSgt = currentManpower.adminSgt; }
                        
                        poolSize += isSecurity ? fltCpl : (fltCpl + fltSgt);
                      });
                      
                      const val = poolSize > 0 ? ((t.totalRequiredMonth || 0) / poolSize) : 0;
                      return (
                        <td key={t.id + 'val'} className="border border-black p-1">
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* DISTRIBUTION AS PER FLIGHT */}
            <div className="mb-8">
              <div className="text-center mb-1">
                <div className="font-bold underline text-[12px]">DISTRIBUTION AS PER FLIGHT</div>
                <div className="underline text-[12px]">FORMULA</div>
              </div>
              <table className="w-full border-collapse border border-black text-center text-[12px]">
                <thead>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <th rowSpan={2} className="border border-black font-bold p-1 align-middle w-32">DUTY PER FLIGHT</th>
                    {matrix.filter(t => !t.isDisabled).map(t => {
                      let title = t.title.split('(')[0].trim();
                      if (title === "IDAC MORNING") title = "Morning";
                      if (title === "IDAC AFTERNOON") title = "Afternoon";
                      if (title === "IDAC NIGHT") title = "Night";
                      
                      return (
                        <th key={t.id} className="border border-black font-bold p-1 px-2">
                          {title}
                        </th>
                      );
                    })}
                  </tr>
                  <tr className="text-[10px]" style={{ backgroundColor: '#ffffff' }}>
                    {matrix.filter(t => !t.isDisabled).map(t => {
                      const isSecurity = t.id === 'security_duty';
                      let targetRank = isSecurity ? 'Total Cpl & Below of Flight' : 'Total Sgt & Below of Flight';
                      const ranksToUse = t.eligibleRanks || DUTY_TYPE_MAP.get(t.dutyCode as any)?.eligibleRanks;
                      if (ranksToUse && ranksToUse.length > 0) {
                         const RANK_ORDER = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
                         const sorted = [...ranksToUse].sort((a, b) => RANK_ORDER.indexOf(a) - RANK_ORDER.indexOf(b));
                         targetRank = 'Total ' + sorted[0] + ' & Below of Flight';
                      }
                      
                      let title = t.title.split('(')[0].trim();
                      if (title === "IDAC MORNING") title = "Morning";
                      else if (title === "IDAC AFTERNOON") title = "Afternoon";
                      else if (title === "IDAC NIGHT") title = "Night";
                      
                      let shortTitle = title.replace('Duty', '').trim();
                      if (shortTitle.length === 0) shortTitle = title;
                      
                      return (
                        <th key={t.id + 'formula_flight'} className="border border-black p-1 font-normal leading-tight">
                          Per Person {shortTitle} Duty x<br/>{targetRank}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {['Mechanics', 'Avionics', 'GCS', 'Admin'].map((fl, i) => (
                    <tr key={fl} style={{ backgroundColor: bgAlt(i) }}>
                      <td className="border border-black font-bold p-1 text-left px-2">{fl.toUpperCase()} FLT</td>
                      {matrix.filter(t => !t.isDisabled).map(t => {
                        if (t.eligibleFlights && !t.eligibleFlights.includes(fl as any)) {
                           return <td key={t.id} className="border border-black p-1">-</td>;
                        }
                        
                        const distribution = calculatedMatrixDistributions[t.id]?.[fl];
                        const autoVal = distribution?.autoVal || 0;
                        const manualVal = t.flightTargets?.[fl as keyof typeof t.flightTargets];
                        const val = manualVal !== undefined ? manualVal : autoVal;
                        
                        return (
                          <td key={t.id} className="border border-black p-1">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <td className="border border-black font-bold p-1 text-left px-2">TOTAL DUTY</td>
                    {matrix.filter(t => !t.isDisabled).map(t => (
                      <td key={t.id} className="border border-black font-bold p-1">{t.totalRequiredMonth}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
          
          {/* PAGE 2+: Matrices */}
          <div className="pt-4">
            {matrix.filter(t => !t.isDisabled).map((table, matrixIdx) => {
              const cleanTitle = table.title.split('(')[0].trim();
              
              return (
                <div key={table.id} className="mb-12 print:break-inside-avoid">
                  <div className="flex justify-between items-end mb-1">
                    <div className="font-bold underline uppercase text-[13px]">{cleanTitle}</div>
                    <div className="flex border border-black text-[12px]">
                      <div className="px-2 py-0.5 border-r border-black" style={{ backgroundColor: '#ffffff' }}>Total Duty</div>
                      <div className="px-4 py-0.5 font-bold" style={{ backgroundColor: '#ffffff' }}>{table.totalRequiredMonth}</div>
                    </div>
                  </div>
                  
                  <table className="w-full border-collapse border border-black text-center text-[11px]">
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <th colSpan={2} className="border border-black font-bold p-1 w-20">Date</th>
                        {daysArray.map(d => (
                          <th key={d} className="border border-black font-bold p-1 w-6">{d}</th>
                        ))}
                        <th className="border border-black font-bold p-1 w-12">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Mechanics', 'Avionics', 'GCS', 'Admin'].map((fl, i) => {
                        const flName = fl as FlightName;
                        const rowData = table.data[flName] || Array(31).fill(0);
                        const rowSum = rowData.reduce((a, b) => a + b, 0);
                        const displayFl = fl === 'Mechanics' ? 'Mech' : fl === 'Avionics' ? 'AVI' : fl;
                        
                        return (
                          <tr key={fl} style={{ backgroundColor: bgAlt(i) }}>
                            <td colSpan={2} className="border border-black font-bold p-1">{displayFl}</td>
                            {daysArray.map((_, dayIdx) => (
                              <td key={dayIdx} className="border border-black p-1">{rowData[dayIdx] > 0 ? rowData[dayIdx] : ''}</td>
                            ))}
                            <td className="border border-black p-1 font-bold">{rowSum > 0 ? rowSum : ''}</td>
                          </tr>
                        );
                      })}
                      
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td rowSpan={2} className="border border-black font-bold p-1 text-center align-middle w-10">Daily</td>
                        <td className="border border-black font-bold p-1 w-10">Total</td>
                        {daysArray.map((_, i) => {
                          const sum = ['Mechanics', 'Avionics', 'GCS', 'Admin'].reduce((acc, fl) => {
                            const val = table.data[fl as FlightName]?.[i] || 0;
                            return acc + val;
                          }, 0);
                          return <td key={i} className="border border-black p-1 font-bold">{sum > 0 ? sum : ''}</td>;
                        })}
                        <td className="border border-black p-1 font-bold">{table.totalRequiredMonth}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td className="border border-black font-bold p-1">Req.</td>
                        {daysArray.map((_, i) => {
                          const req = table.dailyRequirements?.[i] || table.totalRequiredDaily || 0;
                          return <td key={i} className="border border-black p-1">{req > 0 ? req : ''}</td>;
                        })}
                        <td className="border border-black p-1">{table.totalRequiredMonth}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
