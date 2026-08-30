import React, { useEffect, useState } from 'react';
import { FlightName, ParadeShift, Airman, ParadeStateResponse } from '../types';
import { DUTY_TYPE_MAP } from '../data/dutyTypes';
import { formatDutyOnShortName, formatDutyOffShortName } from '../utils/dutyFormatter';
import { Logo155UASU } from './Logo155UASU';
import { X, Printer, Filter, PenTool } from 'lucide-react';
import {
  SignatureDetails,
  getSavedPreparedBy,
  getSavedAuthorizedBy,
  savePreparedBy,
  saveAuthorizedBy,
} from './SignatureConfigModal';

interface PrintableParadeStateModalProps {
  date: string;
  shift: ParadeShift;
  flight: FlightName | 'Overall';
  airmen: Airman[];
  documentType?: 'PARADE' | 'PT';
  onClose: () => void;
}

export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  date,
  shift,
  flight,
  airmen,
  documentType = 'PARADE',
  onClose,
}) => {
  const [fromDate, setFromDate] = useState(date);
  const [toDate, setToDate] = useState(date);
  const [currentFlight, setCurrentFlight] = useState<FlightName | 'Overall'>(flight);
  const [singleParadeData, setSingleParadeData] = useState<ParadeStateResponse | null>(null);
  const [multiDayStates, setMultiDayStates] = useState<Record<string, ParadeStateResponse>>({});
  const [loadingMultiDay, setLoadingMultiDay] = useState(false);

  // Editable Signature Details (Synced with saved localStorage)
  const initialPrep = getSavedPreparedBy();
  const initialAuth = getSavedAuthorizedBy();
  const [leftSig, setLeftSig] = useState<SignatureDetails>(getSavedPreparedBy);
  const [rightSig, setRightSig] = useState<SignatureDetails>(getSavedAuthorizedBy);

  const [leftSigName, setLeftSigName] = useState(initialPrep.name || 'MD NAHID HASAN KHAN');
  const [leftSigRank, setLeftSigRank] = useState(initialPrep.rank || 'SGT');
  const [leftSigDesig, setLeftSigDesig] = useState(initialPrep.designation || 'Admin SNCO');

  const [rightSigName, setRightSigName] = useState(initialAuth.name || 'MD SHAHINUZZAMAN');
  const [rightSigRank, setRightSigRank] = useState(initialAuth.rank || 'WO');
  const [rightSigDesig, setRightSigDesig] = useState(initialAuth.designation || 'WOIC Orderly Room');

  // Keep fromDate/toDate and currentFlight updated when props change
  useEffect(() => {
    setFromDate(date);
    setToDate(date);
    const p = getSavedPreparedBy();
    const a = getSavedAuthorizedBy();
    setLeftSig(p);
    setRightSig(a);
    setLeftSigName(p.name);
    setLeftSigRank(p.rank);
    setLeftSigDesig(p.designation);
    setRightSigName(a.name);
    setRightSigRank(a.rank);
    setRightSigDesig(a.designation);
  }, [date]);

  useEffect(() => {
    setCurrentFlight(flight);
  }, [flight]);

  // Format Date: e.g., "29 Aug 26"
  const formatDateShort = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[dateObj.getMonth()];
    const yearStr = String(dateObj.getFullYear()).slice(-2);
    return `${dayStr} ${monthStr} ${yearStr}`;
  };

  // Format Date Super Short: e.g., "29 Aug"
  const formatDateSuperShort = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayStr} ${months[dateObj.getMonth()]}`;
  };

  // Generate standard PDF / Document title
  const getPdfTitle = () => {
    const formattedDate = formatDateShort(fromDate);
    return documentType === 'PT'
      ? `PT State - Airmen (${formattedDate})`
      : `Parade State - Airmen (${formattedDate})`;
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = getPdfTitle();

    const handleBeforePrint = () => {
      document.title = getPdfTitle();
    };
    const handleAfterPrint = () => {
      // keep current title while modal is open
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      document.title = originalTitle;
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [fromDate, documentType]);

  const handlePrint = () => {
    document.title = getPdfTitle();
    window.print();
  };

  // Calculate list of dates in range
  const getDatesInRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return [date];
    if (startStr > endStr) return [startStr];
    const dates: string[] = [];
    const partsStart = startStr.split('-');
    const partsEnd = endStr.split('-');
    if (partsStart.length !== 3 || partsEnd.length !== 3) return [startStr];

    const curr = new Date(parseInt(partsStart[0]), parseInt(partsStart[1]) - 1, parseInt(partsStart[2]));
    const end = new Date(parseInt(partsEnd[0]), parseInt(partsEnd[1]) - 1, parseInt(partsEnd[2]));

    let limit = 0;
    while (curr <= end && limit < 60) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
      limit++;
    }
    return dates;
  };

  const datesInRange = getDatesInRange(fromDate, toDate);
  const isMultiDay = datesInRange.length > 1;

  // Single Day Fetch (Always fetch Overall to compute all flight breakdowns)
  useEffect(() => {
    const fetchSingle = async () => {
      try {
        const res = await fetch(`/api/parade-state?date=${fromDate}&shift=${shift}&flight=Overall&stateType=${documentType}`);
        if (res.ok) {
          const d = await res.json();
          setSingleParadeData(d);
        }
      } catch (err) {
        console.error('Failed to fetch single parade state:', err);
      }
    };
    fetchSingle();
  }, [fromDate, shift, documentType]);

  // Multi Day Fetch (Always fetch Overall to compute multi-day matrices)
  useEffect(() => {
    if (isMultiDay) {
      setLoadingMultiDay(true);
      Promise.all(
        datesInRange.map((dStr) =>
          fetch(`/api/parade-state?date=${dStr}&shift=${shift}&flight=Overall&stateType=${documentType}`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        )
      ).then((results) => {
        const map: Record<string, ParadeStateResponse> = {};
        datesInRange.forEach((dStr, idx) => {
          if (results[idx]) {
            map[dStr] = results[idx];
          }
        });
        setMultiDayStates(map);
        setLoadingMultiDay(false);
      });
    }
  }, [fromDate, toDate, shift, isMultiDay, datesInRange.length, documentType]);

  // Capitalize Name
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatAirmanName = (name: string) => {
    if (!name) return '';
    // Strip trailing numbers (e.g. 2608..., 2026..., BD numbers attached to names), timestamps, or (2608...)
    const cleaned = name
      .replace(/\s*\(?\b\d{4,}\b\)?\s*$/gi, '')
      .replace(/\s*[-_]\s*\d+\s*$/gi, '')
      .trim();
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map(capitalize)
      .join(' ');
  };

  const getShortFlightName = (flightName?: string) => {
    if (!flightName) return '';
    if (flightName === 'Avionics') return 'Avn';
    if (flightName === 'Mechanics') return 'Mech';
    if (flightName === 'GCS') return 'GCS';
    if (flightName === 'Admin') return 'Adm';
    return flightName;
  };

  // Helper to compute full BAF Parade breakdown statistics for any flight
  const getFlightStats = (fl: FlightName | 'Overall') => {
    const flightAirmen = fl === 'Overall' ? airmen : airmen.filter((a) => a.flightName === fl);
    const rawPersonnel = singleParadeData?.personnelStatusList || [];
    const pList = fl === 'Overall' ? rawPersonnel : rawPersonnel.filter((p) => p.airman.flightName === fl);

    let detTdyCount = 0;
    let leaveCount = 0;
    let essnCount = 0;
    let hospitalCount = 0;
    let sickExCount = 0;
    let koReceptionCount = 0;
    let drillCatCCount = 0;
    let guardDutyCount = 0;
    let bakeBiteCount = 0;
    let floodCellCount = 0;
    let adminCommCount = 0;
    let detentionCount = 0;
    let classTrgCount = 0;
    let airFdDutyCount = 0;
    let gamesCount = 0;
    let absentCount = 0;
    let othersCount = 0;

    if (pList.length > 0) {
      pList.forEach((item) => {
        const { dutyCode, statusCategory, notes } = item;
        const codeUpper = (dutyCode || '').toUpperCase();
        const notesLower = (notes || '').toLowerCase();

        if (codeUpper === 'ON_PARADE' || statusCategory === 'PARADE') {
          // Available on Parade / PT
        } else if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
          leaveCount++;
        } else if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
          detTdyCount++;
        } else if (['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE') {
          bakeBiteCount++;
        } else if (codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
          koReceptionCount++;
        } else if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
          essnCount++;
        } else if (['CMH', 'BNS', 'BSH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh') || notesLower.includes('bns') || notesLower.includes('bsh')) {
          hospitalCount++;
        } else if (['SICK_REPORT', 'SICK', 'EX_PPGF', 'ED'].includes(codeUpper) || notesLower.includes('sick') || notesLower.includes('ppgf')) {
          sickExCount++;
        } else if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper) || notesLower.includes('drill')) {
          drillCatCCount++;
        } else if (['ADMIN_ORDER', 'BOI', 'COMMITTEE'].includes(codeUpper) || notesLower.includes('admin order') || notesLower.includes('boi')) {
          adminCommCount++;
        } else if (['CLASS_TRG', 'CLASS', 'TRG', 'LTTB'].includes(codeUpper) || notesLower.includes('class') || notesLower.includes('trg')) {
          classTrgCount++;
        } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'ATT'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
          airFdDutyCount++;
        } else if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper) || notesLower.includes('games') || notesLower.includes('g/h')) {
          gamesCount++;
        } else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
          absentCount++;
        } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'DUTY_OFF'].includes(codeUpper) || statusCategory === 'DUTY' || statusCategory === 'OFF') {
          guardDutyCount++;
        } else {
          othersCount++;
        }
      });
    }

    const totalStr = flightAirmen.length;
    const effStr = Math.max(0, totalStr - detTdyCount);
    const totalOutPt =
      leaveCount +
      guardDutyCount +
      bakeBiteCount +
      essnCount +
      hospitalCount +
      sickExCount +
      koReceptionCount +
      drillCatCCount +
      floodCellCount +
      adminCommCount +
      detentionCount +
      classTrgCount +
      airFdDutyCount +
      gamesCount +
      absentCount +
      othersCount;

    const onPtParadeCount = Math.max(0, effStr - totalOutPt);

    return {
      totalStr,
      detTdyCount,
      effStr,
      leaveCount,
      essnCount,
      hospitalCount,
      sickExCount,
      koReceptionCount,
      drillCatCCount,
      guardDutyCount,
      bakeBiteCount,
      floodCellCount,
      adminCommCount,
      detentionCount,
      classTrgCount,
      airFdDutyCount,
      totalOutPt,
      onPtParadeCount,
      gamesCount,
      absentCount,
      othersCount,
    };
  };

  // Single-Day Categorization for Bottom Lists
  const targetAirmen = currentFlight === 'Overall'
    ? airmen
    : airmen.filter((a) => a.flightName === currentFlight);

  const onPtList: { airman: Airman; note?: string }[] = [];
  const leaveList: { airman: Airman; note?: string }[] = [];
  const tdyList: { airman: Airman; note?: string }[] = [];
  const dutyOnList: { airman: Airman; note?: string }[] = [];
  const dutyOffList: { airman: Airman; note?: string }[] = [];
  const bakeBiteList: { airman: Airman; note?: string }[] = [];
  const receptionList: { airman: Airman; note?: string }[] = [];
  const airFdDutyList: { airman: Airman; note?: string }[] = [];
  const essnList: { airman: Airman; note?: string }[] = [];
  const cmhList: { airman: Airman; note?: string }[] = [];
  const sickReportList: { airman: Airman; note?: string }[] = [];
  const drillCatCList: { airman: Airman; note?: string }[] = [];
  const adminOrderList: { airman: Airman; note?: string }[] = [];
  const classTrgList: { airman: Airman; note?: string }[] = [];
  const gamesList: { airman: Airman; note?: string }[] = [];
  const absentList: { airman: Airman; note?: string }[] = [];
  const customDisposalsMap: Record<string, { airman: Airman; note?: string }[]> = {};

  const rawList = singleParadeData?.personnelStatusList;
  const statusList = rawList
    ? (currentFlight === 'Overall'
        ? rawList
        : rawList.filter((item) => item.airman.flightName === currentFlight))
    : null;

  if (statusList) {
    statusList.forEach((item) => {
      const { airman, dutyCode, statusCategory, idaShift, notes } = item;
      const codeUpper = (dutyCode || '').toUpperCase();
      const notesLower = (notes || '').toLowerCase();

      if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE') {
        onPtList.push({ airman, note: '' });
      } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {
        const offName = formatDutyOffShortName(item.previousDutyCode, item.previousDutyName, item.dutyName || notes);
        dutyOffList.push({ airman, note: offName });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'AIRPORT', 'AIRFIELD', 'ATT', 'AIR_FD'].includes(codeUpper) || statusCategory === 'DUTY') {
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: dutyDisplay });
      } else {
        let customKey = dutyCode === 'OTHERS' ? (item.notes || 'OTHER DISPOSAL') : (item.dutyName || dutyCode || 'OTHER DISPOSAL');
        if (notes) {
          // Sometimes notes holds the custom disposal name if it's entered in custom field
          // but if it's a standard one, dutyName is better.
          // In AssignDuty, custom disposal stores the name in notes.
          if (!['LEAVE', 'ATT', 'TDY', 'DETT', 'BAKE_N_BITE', 'RECEPTION', 'ESSN', 'CMH', 'SICK_REPORT', 'DRILL_CAT_C', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'].includes(codeUpper)) {
             customKey = notes;
          }
        }
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        const safeNotes = notes && !notesLower.includes('imported') ? notes : undefined;
        customDisposalsMap[customKey].push({ airman, note: safeNotes });
      }
    });
  } else {
    targetAirmen.forEach((airman) => {
      onPtList.push({ airman });
    });
  }

  const otherDisposals: { title: string; airmen: Airman[] }[] = Object.entries(customDisposalsMap).map(
    ([title, items]) => ({
      title,
      airmen: items.map((i) => i.airman),
    })
  );

  // Chunk ON PARADE into max 15 items per vertical column
  const onPtChunks: { airman: Airman; note?: string; globalIndex: number }[][] = [];
  for (let i = 0; i < onPtList.length; i += 15) {
    onPtChunks.push(
      onPtList.slice(i, i + 15).map((item, idx) => ({
        ...item,
        globalIndex: i + idx + 1,
      }))
    );
  }

  // Helper to render airman list inside multi-day table cells
  const renderAirmanColumnList = (list: { airman: Airman }[]) => {
    if (!list || list.length === 0) {
      return <div className="text-center text-slate-400 font-normal py-1">-</div>;
    }
    return (
      <ol className="space-y-0.5 text-[11px] leading-snug font-normal text-left">
        {list.map((item, idx) => (
          <li key={idx} className="whitespace-nowrap">
            {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
            {currentFlight === 'Overall' && (
              <span className="text-[9px] text-slate-500 font-mono ml-1">
                ({getShortFlightName(item.airman.flightName)})
              </span>
            )}
          </li>
        ))}
      </ol>
    );
  };

  const flightsList: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
  const overallStats = getFlightStats('Overall');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible printable-modal-overlay">
      {/* PRINT CSS STYLES FOR EXACT A4 LANDSCAPE */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Arial, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .printable-modal-overlay {
            position: static !important;
            background: transparent !important;
            background-color: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
            overflow: visible !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .printable-modal-card {
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          #printable-area {
            font-family: Arial, sans-serif !important;
            font-size: 11px !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            box-sizing: border-box !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-lg max-w-7xl w-full p-4 sm:p-6 my-4 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 print:rounded-none printable-modal-card">
        
        {/* NON-PRINTABLE TOOLBAR: ONLY PRINT DOCUMENT / SAVE PDF + ESSENTIAL DATE/FLIGHT SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              {documentType === 'PT' ? 'PT State' : 'Parade State'} - Airmen
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {formatDateShort(fromDate)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="font-medium text-slate-600">Date:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setToDate(e.target.value);
                }}
                className="bg-white px-1.5 py-0.5 border border-slate-300 rounded text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentFlight}
                onChange={(e) => setCurrentFlight(e.target.value as any)}
                className="bg-transparent text-slate-900 font-semibold outline-none cursor-pointer"
              >
                <option value="Overall">Overall Flight (All)</option>
                <option value="Avionics">Avionics Flight</option>
                <option value="Mechanics">Mechanics Flight</option>
                <option value="GCS">GCS Flight</option>
                <option value="Admin">Admin Flight</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE PAGE CONTENT */}
        <div id="printable-area" className="w-full bg-white">
          {isMultiDay ? (
            /* MULTI-DAY PARADE & DUTY DISPOSAL TABLE */
            <div>
              {/* DOCUMENT TOP HEADER */}
              <div className="relative mb-3 text-center flex items-center justify-between" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <Logo155UASU className="h-16 w-16" />
                </div>
                <div className="flex-1 text-center">
                  <h1 className="font-bold tracking-wide text-slate-900 underline inline-block text-base uppercase">
                    {documentType === 'PT'
                      ? 'PT STATE & DAILY DUTY REGISTER : AIRMEN'
                      : 'PARADE STATE & DAILY DUTY REGISTER : AIRMEN'}
                  </h1>
                  <br />
                  <h2 className="font-bold tracking-wide text-slate-900 mt-0.5 underline inline-block text-sm uppercase">
                    155 UASU BAF {currentFlight !== 'Overall' ? `(${currentFlight.toUpperCase()} FLIGHT)` : ''}
                  </h2>
                </div>
                <div className="w-28 text-right font-normal text-slate-900 pr-1 text-xs shrink-0">
                  Period: {formatDateShort(fromDate)} To {formatDateShort(toDate)}
                </div>
              </div>

              {loadingMultiDay ? (
                <div className="py-12 text-center text-slate-500 font-bold">
                  Loading {documentType === 'PT' ? 'PT' : 'parade'} state records...
                </div>
              ) : (
                <div className="overflow-x-auto my-3">
                  <table className="w-full text-center align-middle border-collapse border-2 border-slate-900 text-[11px]">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900">
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Date</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Day</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Base Security Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Base Taskforce Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Najirpara Taskforce Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Airfield Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Halishahar Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Bake N Bite</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Tdy</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Leave</th>
                        <th className="border border-slate-800 p-1.5" colSpan={3}>IDA CENTER Duty</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>Duty Off</th>
                        <th className="border border-slate-800 p-1.5" rowSpan={2}>{documentType === 'PT' ? 'On PT' : 'On Parade'}</th>
                      </tr>
                      <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-900">
                        <th className="border border-slate-800 p-1">Morning</th>
                        <th className="border border-slate-800 p-1">Afternoon</th>
                        <th className="border border-slate-800 p-1">Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datesInRange.map((dStr) => {
                        const resData = multiDayStates[dStr];
                        const rawPersonnel = resData?.personnelStatusList || [];
                        const pList = currentFlight === 'Overall'
                          ? rawPersonnel
                          : rawPersonnel.filter((s) => s.airman.flightName === currentFlight);

                        // Parse day name and weekend status
                        const pParts = dStr.split('-');
                        const dateObj = new Date(parseInt(pParts[0]), parseInt(pParts[1]) - 1, parseInt(pParts[2]));
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = days[dateObj.getDay()];
                        const isWeekend = dateObj.getDay() === 5 || dateObj.getDay() === 6; // Friday or Saturday

                        // Filter lists for table columns
                        const baseSec = pList.filter((s) => s.dutyCode === 'GD' || s.notes?.toLowerCase().includes('base sec'));
                        const btf = pList.filter((s) => s.dutyCode === 'BTF');
                        const ntf = pList.filter((s) => s.dutyCode === 'NTF');
                        const airfield = pList.filter((s) => s.dutyCode === 'AIRPORT' || s.dutyCode === 'AIR_FD' || s.notes?.toLowerCase().includes('airfield') || s.notes?.toLowerCase().includes('air fd'));
                        const halishahar = pList.filter((s) => s.dutyCode === 'HALISHAHAR');
                        const bakeBite = pList.filter((s) => s.dutyCode === 'BAKE_BITE' || s.dutyCode === 'BAKE_N_BITE' || s.statusCategory === 'BAKE_N_BITE');
                        const tdy = pList.filter((s) => ['TDY', 'ATT', 'DETT'].includes(s.dutyCode));
                        const leave = pList.filter((s) => s.dutyCode === 'LEAVE');
                        const idaMorn = pList.filter((s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Morning');
                        const idaAft = pList.filter((s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Afternoon');
                        const idaNight = pList.filter((s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Night');
                        const dutyOff = pList.filter((s) => s.dutyCode === 'DUTY_OFF');
                        const onParade = pList.filter((s) => s.dutyCode === 'ON_PARADE' || s.statusCategory === 'PARADE');

                        return (
                          <tr
                            key={dStr}
                            className={`border-b border-slate-800 align-top ${
                              isWeekend ? 'text-red-600 font-semibold' : 'text-slate-900'
                            }`}
                          >
                            <td className="border border-slate-800 p-1.5 whitespace-nowrap font-bold text-center">
                              {formatDateSuperShort(dStr)}
                            </td>
                            <td className="border border-slate-800 p-1.5 whitespace-nowrap text-center">
                              {dayName}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(baseSec)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(btf)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(ntf)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(airfield)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(halishahar)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(bakeBite)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(tdy)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(leave)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(idaMorn)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(idaAft)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(idaNight)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(dutyOff)}
                            </td>
                            <td className="border border-slate-800 p-1.5">
                              {renderAirmanColumnList(onParade)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* SPACER ROW: 0.6 INCH HEIGHT TO PROVIDE SIGNATURE HEADROOM */}
                  <div className="w-full" style={{ height: '0.6in' }} />

                  {/* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY */}
                  <table className="w-full border-none" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <tbody>
                      <tr>
                        <td className="w-1/2 align-top text-left pl-2 border-none">
                          <div className="space-y-0.5">
                            <p className="font-bold text-black uppercase tracking-wide">
                              {leftSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{leftSigRank}</p>
                            <p className="font-normal text-black">{leftSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>
                          </div>
                        </td>
                        <td className="w-1/2 align-top text-right pr-2 border-none">
                          <div className="space-y-0.5 inline-block text-left">
                            <p className="font-bold text-black uppercase tracking-wide">
                              {rightSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{rightSigRank}</p>
                            <p className="font-normal text-black">{rightSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE-DAY PARADE/PT STATE FORMAT (FLIGHT-WISE BREAKDOWN) */
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* TOP DOCUMENT HEADER */}
              <div className="relative mb-4 text-center">
                <h1 className="font-bold tracking-wider text-black underline inline-block text-base uppercase">
                  {documentType === 'PT' ? 'PT STATE : AIRMEN' : 'PARADE STATE : AIRMEN'}
                </h1>
                <br />
                <h2 className="font-bold tracking-wider text-black mt-0.5 underline inline-block text-sm uppercase">
                  155 UASU BAF
                </h2>
                <div className="text-right font-bold text-black text-xs mt-1">
                  Date: {formatDateShort(fromDate)}
                </div>
              </div>

              {/* 1ST TABLE: SUMMARY MATRIX TABLE */}
              <div className="overflow-x-auto my-2">
                <table
                  className="w-full text-center align-middle border-collapse border border-black"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '10px',
                    border: '1px solid black',
                    tableLayout: 'fixed',
                    width: '100%',
                  }}
                >
                  <colgroup>
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '3.8%' }} />
                    <col style={{ width: '3.8%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '4.2%' }} />
                    <col style={{ width: '5.5%' }} />
                    <col style={{ width: '5.5%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '4.9%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ height: '78px' }} className="border border-black bg-white">
                      <th className="border border-black p-0.5 align-middle text-center font-bold text-[10px]">
                        Unit
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Total str
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Det/ Tdy
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Eff str
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Leave
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          ESSN
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          CMH
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Sick Report
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Recep- tion
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Drill Cat-C
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Guard Duty
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Bake & Bite
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Flood Cell
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Admin Order
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Deten- tion
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Class/ Trg
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Air Fd Duty
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center font-bold">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          {documentType === 'PT' ? 'Total Out PT' : 'Total Out Parade'}
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center font-bold">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          {documentType === 'PT' ? 'On PT' : 'On Parade'}
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Games
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Absent
                        </div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center">
                        <div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Rmk
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const stats = getFlightStats(currentFlight);
                      const unitLabel = '155 UASU BAF';

                      return (
                        <tr className="text-black border border-black bg-white text-[10px]">
                          <td className="border border-black p-0.5 text-center font-bold whitespace-nowrap">
                            {unitLabel}
                          </td>
                          <td className="border border-black p-0.5">{stats.totalStr}</td>
                          <td className="border border-black p-0.5">{stats.detTdyCount > 0 ? stats.detTdyCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.effStr}</td>
                          <td className="border border-black p-0.5">{stats.leaveCount > 0 ? stats.leaveCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.floodCellCount > 0 ? stats.floodCellCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.adminCommCount > 0 ? stats.adminCommCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.detentionCount > 0 ? stats.detentionCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.classTrgCount > 0 ? stats.classTrgCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.airFdDutyCount > 0 ? stats.airFdDutyCount : '-'}</td>
                          <td className="border border-black p-0.5 font-bold">{stats.totalOutPt}</td>
                          <td className="border border-black p-0.5 font-bold">{stats.onPtParadeCount}</td>
                          <td className="border border-black p-0.5">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                          <td className="border border-black p-0.5">{stats.absentCount > 0 ? stats.absentCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center">-</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* SPACING BETWEEN 1ST & 2ND TABLE: FONT SIZE 1 (MINIMAL GAP) */}
              <div style={{ fontSize: '1px', lineHeight: '1px', height: '2px' }} className="w-full select-none" />

              {/* 2ND TABLE: 4-COLUMN DISPOSAL BREAKDOWN (ALL BORDERS INVISIBLE) */}
              <div className="overflow-x-auto mt-2">
                <table
                  className="w-full text-left align-top border-collapse"
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',
                    border: 'none',
                    borderSpacing: '0',
                    tableLayout: 'fixed',
                    width: '100%',
                  }}
                >
                  <colgroup>
                    <col style={{ width: '36%' }} />
                    <col style={{ width: '21%' }} />
                    <col style={{ width: '21%' }} />
                    <col style={{ width: '22%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      {/* 1st Column: 36% -> ON PARADE / ON PT (1 to 15 left, 16+ right, Nil if empty) */}
                      <td
                        style={{
                          width: '36%',
                          verticalAlign: 'top',
                          border: 'none',
                          paddingRight: '12px',
                        }}
                      >
                        <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                          {documentType === 'PT' ? 'ON PT' : 'ON PARADE'}
                        </div>
                        {onPtList.length > 0 ? (
                          <div className="flex items-start space-x-3 w-full">
                            <ol className="space-y-0.5 font-normal leading-tight w-1/2 overflow-hidden text-[11px]">
                              {onPtList.slice(0, 15).map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                            {onPtList.length > 15 && (
                              <ol className="space-y-0.5 font-normal leading-tight w-1/2 overflow-hidden text-[11px]">
                                {onPtList.slice(15).map((item, idx) => (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {16 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ) : (
                          <div className="font-bold text-black text-[11px]">Nil</div>
                        )}
                      </td>

                      {/* 2nd Column: 21% -> LEAVE, BAKE & BITE, ESSN, CMH, SICK REPORT */}
                      <td
                        style={{
                          width: '21%',
                          verticalAlign: 'top',
                          border: 'none',
                          paddingRight: '12px',
                        }}
                      >
                        {leaveList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              LEAVE
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {leaveList.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {bakeBiteList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              BAKE & BITE
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {bakeBiteList.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {essnList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              ESSN
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {essnList.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {cmhList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              BNS/BSH/CMH
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {cmhList.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {sickReportList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              SICK REPORT
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {sickReportList.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap truncate">
                                  {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </td>

                                            {/* 3rd & 4th Column: Disposals (Dynamically Split) */}
                      <td
                        style={{
                          width: '21%',
                          verticalAlign: 'top',
                          border: 'none',
                          paddingRight: '12px',
                        }}
                      >
                        {otherDisposals.slice(0, Math.ceil(otherDisposals.length / 2)).map((cat, cIdx) => (
                          <div key={cIdx} className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              {cat.title}
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {cat.airmen.map((a, aIdx) => (
                                <li key={aIdx} className="whitespace-nowrap truncate">
                                  {aIdx + 1}. {a.rank} {a.name.split(' ').pop()}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </td>
                      <td
                        style={{
                          width: '22%',
                          verticalAlign: 'top',
                          border: 'none',
                        }}
                      >
                        {dutyOnList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              DUTY ON
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {dutyOnList.map((item, idx) => {
                                const noteText = item.note || 'GD';
                                return (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {idx + 1}. {item.airman.rank} {item.airman.name.split(' ').pop()} - {noteText}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                        {documentType !== 'PT' && dutyOffList.length > 0 && (
                          <div className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              DUTY OFF
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {dutyOffList.map((item, idx) => {
                                let dNote = item.note || 'GD Off';
                                if (dNote.toLowerCase().includes('imported')) dNote = 'GD Off';
                                dNote = dNote.replace(/\s*\(?\b\d{4,}\b\)?/gi, '').replace(/\s*\(dt\s*\d*\)/gi, '(dt)').trim();
                                if (!dNote.toLowerCase().endsWith('off') && !dNote.toLowerCase().includes('off')) {
                                  dNote = `${dNote} Off`;
                                }
                                return (
                                  <li key={idx} className="whitespace-nowrap truncate">
                                    {idx + 1}. {item.airman.rank} {item.airman.name.split(' ').pop()} - {dNote}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}
                        {otherDisposals.slice(Math.ceil(otherDisposals.length / 2)).map((cat, cIdx) => (
                          <div key={cIdx} className="mb-3.5">
                            <div className="font-bold underline uppercase mb-1.5 text-[11px]">
                              {cat.title}
                            </div>
                            <ol className="space-y-0.5 font-normal leading-tight text-[11px]">
                              {cat.airmen.map((a, aIdx) => (
                                <li key={aIdx} className="whitespace-nowrap truncate">
                                  {aIdx + 1}. {a.rank} {a.name.split(' ').pop()}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </td>
                    </tr>
                    {/* SPACER ROW BETWEEN 1ST & 2ND ROWS: Ample room for manual / digital signatures */}
                    {!isMultiDay && (
                      <tr style={{ height: '36px' }}>
                        <td colSpan={4} style={{ height: '36px', border: 'none', padding: 0 }} />
                      </tr>
                    )}

                    {/* 2nd Row: Signatures */}
                    {!isMultiDay && (
                      <tr>
                        <td
                          style={{
                            width: '36%',
                            verticalAlign: 'bottom',
                            border: 'none',
                            paddingTop: '28px',
                          }}
                        >
                          <div className="space-y-0.5 text-left text-[11px]">
                            {leftSig.signDigitally && (
                              <div className="mb-1 text-left font-serif italic text-xs text-black select-none">
                                <span className="font-bold underline">
                                  {leftSig.digitalSignatureText || leftSigName}
                                </span>
                                <span className="block text-[8px] font-mono not-italic text-slate-700">
                                  [Digitally Signed • BAF Verified]
                                </span>
                              </div>
                            )}
                            <p className="font-bold text-black uppercase tracking-wide">
                              {leftSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{leftSigRank}</p>
                            <p className="font-normal text-black">{leftSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>
                          </div>
                        </td>
                        <td style={{ width: '21%', border: 'none', paddingTop: '28px' }} />
                        <td style={{ width: '21%', border: 'none', paddingTop: '28px' }} />
                        <td
                          style={{
                            width: '22%',
                            verticalAlign: 'bottom',
                            border: 'none',
                            paddingTop: '28px',
                          }}
                        >
                          <div className="space-y-0.5 text-left text-[11px]">
                            {rightSig.signDigitally && (
                              <div className="mb-1 text-left font-serif italic text-xs text-black select-none">
                                <span className="font-bold underline">
                                  {rightSig.digitalSignatureText || rightSigName}
                                </span>
                                <span className="block text-[8px] font-mono not-italic text-slate-700">
                                  [Digitally Signed • BAF Verified]
                                </span>
                              </div>
                            )}
                            <p className="font-bold text-black uppercase tracking-wide">
                              {rightSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{rightSigRank}</p>
                            <p className="font-normal text-black">{rightSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
