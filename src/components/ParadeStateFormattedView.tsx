import React, { useState, useEffect } from 'react';
import {
  Airman,
  FlightName,
  ParadeShift,
  ParadeStateResponse,
  UserRole,
  DutyCategoryCode,
  IDAShift,
} from '../types';
import { DUTY_TYPES, DUTY_TYPE_MAP } from '../data/dutyTypes';
import { Logo155UASU } from './Logo155UASU';
import {
  Calendar,
  Printer,
  RefreshCw,
  Shield,
  Users,
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  MapPin,
  Phone,
  Sliders,
  CalendarRange,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  UserPlus,
} from 'lucide-react';
import { DutyCellPopover } from './DutyCellPopover';
import { getStoredDutyRatiosForDate } from '../data/dutyRatios';
import { getIdacShiftsForDateAndFlight } from '../data/officialDutyRatioMatrix';
import { FlightDutyRatioModal } from './FlightDutyRatioModal';
import { PrintableParadeStateModal } from './PrintableParadeStateModal';
import {
  exportParadeStateSingleDocx,
  exportParadeStateMultiDocx,
  MultiParadeDayItem,
} from '../utils/docxExport';

interface ParadeStateFormattedViewProps {
  role?: UserRole;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  airmen: Airman[];
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
}

export const ParadeStateFormattedView: React.FC<ParadeStateFormattedViewProps> = ({
  role = 'ADMIN',
  selectedDate,
  setSelectedDate,
  airmen,
  onOpenPrintModal,
  onViewAirmanProfile,
}) => {
  const [fromDate, setFromDate] = useState<string>(selectedDate);
  const [toDate, setToDate] = useState<string>(selectedDate);
  const [selectedFlight, setSelectedFlight] = useState<FlightName | 'Overall'>('Overall');

  const [singleParadeData, setSingleParadeData] = useState<ParadeStateResponse | null>(null);
  const [multiDayStates, setMultiDayStates] = useState<Record<string, ParadeStateResponse>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Search and status filter for Nominal Status List
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PARADE' | 'DUTY' | 'LEAVE' | 'TDY' | 'BAKE_N_BITE'>('ALL');
  const [showNominalSection, setShowNominalSection] = useState<boolean>(false);

  // Internal Print Modal state
  const [isInternalPrintOpen, setIsInternalPrintOpen] = useState<boolean>(false);

  // Single Airman Row Quick Edit Popover
  const [activeEditCell, setActiveEditCell] = useState<{
    airman: Airman;
    date: string;
    dutyCode: DutyCategoryCode;
    idaShift?: IDAShift;
    proxyForFlight?: FlightName;
    notes?: string;
  } | null>(null);

  // Add Disposal Modal State
  const [showAddDisposalModal, setShowAddDisposalModal] = useState<boolean>(false);
  const [disposalDateMode, setDisposalDateMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [disposalFlight, setDisposalFlight] = useState<FlightName>('Avionics');
  const [disposalCategory, setDisposalCategory] = useState<string>('ESSN');
  const [disposalCustomTitle, setDisposalCustomTitle] = useState<string>('');
  const [disposalAirmanId, setDisposalAirmanId] = useState<string>('');
  const [disposalFromDate, setDisposalFromDate] = useState<string>(selectedDate);
  const [disposalToDate, setDisposalToDate] = useState<string>(selectedDate);
  const [disposalNotes, setDisposalNotes] = useState<string>('');
  const [disposalLoading, setDisposalLoading] = useState<boolean>(false);
  const [disposalSuccessMsg, setDisposalSuccessMsg] = useState<string>('');

  // Flight Duty Ratio / Quota States
  const [showRatioModal, setShowRatioModal] = useState<boolean>(false);
  const [ratioRefreshTrigger, setRatioRefreshTrigger] = useState<number>(0);
  const [filterByRatio, setFilterByRatio] = useState<boolean>(true);

  // Editable Signature Details
  const [leftSigName, setLeftSigName] = useState('MD NAHID HASAN KHAN');
  const [leftSigRank, setLeftSigRank] = useState('SGT');
  const [leftSigDesig, setLeftSigDesig] = useState('UWO');

  const [rightSigName, setRightSigName] = useState('MD SHAHINUZZAMAN');
  const [rightSigRank, setRightSigRank] = useState('WO');
  const [rightSigDesig, setRightSigDesig] = useState('WOIC Orderly Room');

  // Keep fromDate/toDate in sync when parent selectedDate updates
  useEffect(() => {
    setFromDate(selectedDate);
    setToDate(selectedDate);
    setDisposalFromDate(selectedDate);
    setDisposalToDate(selectedDate);
  }, [selectedDate]);

  // Format Date: e.g. "14 Aug 26"
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

  const formatDateSuperShort = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayStr} ${months[dateObj.getMonth()]}`;
  };

  const getShortFlightName = (flName?: string) => {
    if (!flName) return '';
    if (flName.toLowerCase().includes('avionics')) return 'Avn';
    if (flName.toLowerCase().includes('mechanics')) return 'Mech';
    if (flName.toLowerCase().includes('gcs')) return 'GCS';
    if (flName.toLowerCase().includes('admin')) return 'Adm';
    return flName.slice(0, 4);
  };

  const formatAirmanName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Calculate list of dates in range
  const getDatesInRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return [selectedDate];
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

  // Single Day Fetch
  const fetchSingle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parade-state?date=${fromDate}&shift=Morning&flight=Overall`);
      if (res.ok) {
        const d = await res.json();
        setSingleParadeData(d);
      }
    } catch (err) {
      console.error('Failed to fetch single parade state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Multi Day Fetch
  const fetchMulti = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        datesInRange.map((dStr) =>
          fetch(`/api/parade-state?date=${dStr}&shift=Morning&flight=Overall`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        )
      );
      const newMap: Record<string, ParadeStateResponse> = {};
      datesInRange.forEach((dStr, idx) => {
        if (results[idx]) {
          newMap[dStr] = results[idx];
        }
      });
      setMultiDayStates(newMap);
    } catch (err) {
      console.error('Failed to fetch multi-day parade state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMultiDay) {
      fetchMulti();
    } else {
      fetchSingle();
    }
    const handleGlobalUpdate = () => {
      if (isMultiDay) fetchMulti();
      else fetchSingle();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [fromDate, toDate]);

  // Quick Preset Handlers (Calculated relative to selected fromDate)
  const handleSetPreset = (type: 'today' | '7days' | '15days' | 'month') => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (type === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
      setSelectedDate(todayStr);
    } else if (type === '7days') {
      const baseDateStr = fromDate || todayStr;
      const [bY, bM, bD] = baseDateStr.split('-').map(Number);
      const target = new Date(bY, bM - 1, bD);
      target.setDate(target.getDate() + 6);
      const tY = target.getFullYear();
      const tM = String(target.getMonth() + 1).padStart(2, '0');
      const tD = String(target.getDate()).padStart(2, '0');
      setToDate(`${tY}-${tM}-${tD}`);
    } else if (type === '15days') {
      const baseDateStr = fromDate || todayStr;
      const [bY, bM, bD] = baseDateStr.split('-').map(Number);
      const target = new Date(bY, bM - 1, bD);
      target.setDate(target.getDate() + 14);
      const tY = target.getFullYear();
      const tM = String(target.getMonth() + 1).padStart(2, '0');
      const tD = String(target.getDate()).padStart(2, '0');
      setToDate(`${tY}-${tM}-${tD}`);
    } else if (type === 'month') {
      const baseDateStr = fromDate || todayStr;
      const [bY, bM] = baseDateStr.split('-').map(Number);
      const firstDay = `${bY}-${String(bM).padStart(2, '0')}-01`;
      const lastDate = new Date(bY, bM, 0).getDate();
      const lastDay = `${bY}-${String(bM).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;
      setFromDate(firstDay);
      setToDate(lastDay);
    }
  };

  // Handle single row duty assignment save
  const handleSaveSingleRowDuty = async (code: DutyCategoryCode, idaShift?: IDAShift, notes?: string, proxyForFlight?: FlightName) => {
    if (!activeEditCell) return;
    const monthKey = activeEditCell.date.slice(0, 7);
    try {
      const res = await fetch('/api/roster/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthKey,
          assignment: {
            airmanId: activeEditCell.airman.id,
            date: activeEditCell.date,
            dutyCode: code,
            idaShift,
            proxyForFlight,
            notes,
          },
        }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
      }
    } catch (err) {
      console.error('Failed to save row duty:', err);
    } finally {
      setActiveEditCell(null);
    }
  };

  // Handle single row duty delete
  const handleDeleteRowDuty = async () => {
    if (!activeEditCell) return;
    try {
      const res = await fetch('/api/roster/delete-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: activeEditCell.airman.id,
          date: activeEditCell.date,
        }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
      }
    } catch (err) {
      console.error('Failed to delete row duty:', err);
    } finally {
      setActiveEditCell(null);
    }
  };

  // Handle Add Disposal submit
  const handleAddDisposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposalAirmanId || !disposalFromDate || !disposalToDate) return;

    setDisposalLoading(true);
    setDisposalSuccessMsg('');
    try {
      const isCustom = disposalCategory === 'OTHERS';
      const effectiveDutyCode = isCustom ? 'OTHERS' : disposalCategory;
      const effectiveNotes = isCustom
        ? (disposalCustomTitle.trim() ? `${disposalCustomTitle.trim()}${disposalNotes ? ` - ${disposalNotes}` : ''}` : disposalNotes)
        : disposalNotes;

      const res = await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: disposalAirmanId,
          dutyCode: effectiveDutyCode,
          fromDate: disposalFromDate,
          toDate: disposalToDate,
          notes: effectiveNotes,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        const selectedA = airmen.find((a) => a.id === disposalAirmanId);
        const nameLabel = selectedA ? `${selectedA.rank} ${selectedA.name}` : 'Airman';
        setDisposalSuccessMsg(`✅ Disposal assigned to ${nameLabel} successfully!`);
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
        setTimeout(() => {
          setShowAddDisposalModal(false);
          setDisposalSuccessMsg('');
        }, 1200);
      } else {
        alert(result.error || 'Failed to add disposal');
      }
    } catch (err: any) {
      console.error('Failed to submit disposal:', err);
      alert(`Error adding disposal: ${err?.message || 'Network request failed'}`);
    } finally {
      setDisposalLoading(false);
    }
  };

  const handleExportOrPrint = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal();
    } else {
      setIsInternalPrintOpen(true);
    }
  };

  const handleDownloadDocx = async () => {
    if (isMultiDay) {
      const rows: MultiParadeDayItem[] = datesInRange.map((dStr) => {
        const resData = multiDayStates[dStr];
        const rawPersonnel = resData?.personnelStatusList || [];
        const pList =
          selectedFlight === 'Overall'
            ? rawPersonnel
            : rawPersonnel.filter((s) => s.airman.flightName === selectedFlight);

        const pParts = dStr.split('-');
        const dateObj = new Date(
          parseInt(pParts[0]),
          parseInt(pParts[1]) - 1,
          parseInt(pParts[2])
        );
        const days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const dayName = days[dateObj.getDay()];

        const baseSec = pList.filter(
          (s) => s.dutyCode === 'GD' || s.notes?.toLowerCase().includes('base sec')
        );
        const btf = pList.filter((s) => s.dutyCode === 'BTF');
        const ntf = pList.filter((s) => s.dutyCode === 'NTF');
        const airfield = pList.filter(
          (s) =>
            s.dutyCode === 'AIRPORT' ||
            s.dutyCode === 'AIR_FD' ||
            s.notes?.toLowerCase().includes('airfield') ||
            s.notes?.toLowerCase().includes('air fd')
        );
        const halishahar = pList.filter((s) => s.dutyCode === 'HALISHAHAR');
        const bakeBite = pList.filter(
          (s) =>
            s.dutyCode === 'BAKE_BITE' ||
            s.dutyCode === 'BAKE_N_BITE' ||
            s.statusCategory === 'BAKE_N_BITE'
        );
        const tdy = pList.filter((s) => ['TDY', 'ATT', 'DETT'].includes(s.dutyCode));
        const leave = pList.filter((s) => s.dutyCode === 'LEAVE');
        const idaMorn = pList.filter(
          (s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Morning'
        );
        const idaAft = pList.filter(
          (s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Afternoon'
        );
        const idaNight = pList.filter(
          (s) => ['IDAC', 'IDA'].includes(s.dutyCode) && s.idaShift === 'Night'
        );
        const dutyOff = pList.filter(
          (s) => s.dutyCode === 'DUTY_OFF' || s.statusCategory === 'OFF'
        );
        const onParade = pList.filter(
          (s) => s.dutyCode === 'ON_PARADE' || s.statusCategory === 'PARADE'
        );

        const formatListStr = (items: typeof pList) =>
          items.length > 0
            ? items
                .map((it, idx) => `${idx + 1}. ${it.airman.rank} ${it.airman.name}`)
                .join('\n')
            : '-';

        return {
          dateDisplay: formatDateSuperShort(dStr),
          dayDisplay: dayName,
          baseSec: formatListStr(baseSec),
          btf: formatListStr(btf),
          ntf: formatListStr(ntf),
          airfield: formatListStr(airfield),
          halishahar: formatListStr(halishahar),
          bakeBite: formatListStr(bakeBite),
          tdy: formatListStr(tdy),
          leave: formatListStr(leave),
          idaMorning: formatListStr(idaMorn),
          idaAfternoon: formatListStr(idaAft),
          idaNight: formatListStr(idaNight),
          dutyOff: formatListStr(dutyOff),
          onParade: formatListStr(onParade),
        };
      });

      const unitHeader =
        selectedFlight === 'Overall'
          ? '155 UASU BAF'
          : `155 UASU BAF (${selectedFlight.toUpperCase()} FLT)`;
      const dateRangeHeader = `${formatDateShort(fromDate)} to ${formatDateShort(toDate)}`;
      await exportParadeStateMultiDocx(unitHeader, dateRangeHeader, rows);
    } else {
      const stats = getFlightStats(selectedFlight);
      await exportParadeStateSingleDocx({
        dateStr: formatDateShort(fromDate),
        flight: selectedFlight,
        stats,
        onParade: onPtList.map((i) => i.airman),
        leave: leaveList.map((i) => i.airman),
        bakeBite: bakeBiteList.map((i) => i.airman),
        tdy: tdyList.map((i) => i.airman),
        reception: receptionList.map((i) => i.airman),
        dutyOn: dutyOnList,
        dutyOff: dutyOffList,
        airFdDuty: airFdDutyList.map((i) => i.airman),
      });
    }
  };

  // Compute Flight Stats for Single-Day Summary Matrix
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

        if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
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
        } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'AIRFIELD_DUTY'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
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
  const targetAirmen = selectedFlight === 'Overall' ? airmen : airmen.filter((a) => a.flightName === selectedFlight);

  const onPtList: { airman: Airman; note?: string }[] = [];
  const leaveList: { airman: Airman; note?: string }[] = [];
  const essnList: { airman: Airman; note?: string }[] = [];
  const cmhList: { airman: Airman; note?: string }[] = [];
  const sickReportList: { airman: Airman; note?: string }[] = [];
  const drillCatCList: { airman: Airman; note?: string }[] = [];
  const tdyList: { airman: Airman; note?: string }[] = [];
  const receptionList: { airman: Airman; note?: string }[] = [];
  const airFdDutyList: { airman: Airman; note?: string }[] = [];
  const adminOrderList: { airman: Airman; note?: string }[] = [];
  const classTrgList: { airman: Airman; note?: string }[] = [];
  const dutyOnList: { airman: Airman; note?: string }[] = [];
  const dutyOffList: { airman: Airman; note?: string }[] = [];
  const bakeBiteList: { airman: Airman; note?: string }[] = [];
  const gamesList: { airman: Airman; note?: string }[] = [];
  const absentList: { airman: Airman; note?: string }[] = [];
  const customDisposalsMap: Record<string, { airman: Airman; note?: string }[]> = {};

  const rawList = singleParadeData?.personnelStatusList;
  const statusList = rawList
    ? selectedFlight === 'Overall'
      ? rawList
      : rawList.filter((item) => item.airman.flightName === selectedFlight)
    : null;

  if (statusList) {
    statusList.forEach((item) => {
      const { airman, dutyCode, statusCategory, idaShift, notes } = item;
      const codeUpper = (dutyCode || '').toUpperCase();
      const notesLower = (notes || '').toLowerCase();

      if (statusCategory === 'PARADE' || codeUpper === 'ON_PARADE') {
        onPtList.push({ airman, note: notes });
      } else if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
        leaveList.push({ airman, note: notes });
      } else if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
        essnList.push({ airman, note: notes || 'ESSN' });
      } else if (['CMH', 'BNS', 'BSH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh') || notesLower.includes('bns') || notesLower.includes('bsh')) {
        cmhList.push({ airman, note: notes || codeUpper });
      } else if (['SICK_REPORT', 'SICK', 'EX_PPGF', 'ED'].includes(codeUpper) || notesLower.includes('sick') || notesLower.includes('ppgf')) {
        sickReportList.push({ airman, note: notes || 'Sick Report' });
      } else if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper) || notesLower.includes('drill')) {
        drillCatCList.push({ airman, note: notes || "Drill Cat 'C'" });
      } else if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
        tdyList.push({ airman, note: notes || 'TDY' });
      } else if (['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE') {
        bakeBiteList.push({ airman, note: notes || 'Bake & Bite' });
      } else if (codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
        receptionList.push({ airman, note: notes || 'Reception' });
      } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'AIRFIELD_DUTY'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
        airFdDutyList.push({ airman, note: notes || 'Air Fd Duty' });
      } else if (['ADMIN_ORDER', 'BOI', 'COMMITTEE'].includes(codeUpper) || notesLower.includes('admin order') || notesLower.includes('boi')) {
        adminOrderList.push({ airman, note: notes || 'Admin Order' });
      } else if (['CLASS_TRG', 'CLASS', 'TRG', 'LTTB'].includes(codeUpper) || notesLower.includes('class') || notesLower.includes('trg')) {
        classTrgList.push({ airman, note: notes || 'Class/Trg' });
      } else if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper) || notesLower.includes('games') || notesLower.includes('g/h')) {
        gamesList.push({ airman, note: notes || 'G/H & Games' });
      } else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
        absentList.push({ airman, note: notes || 'Absent' });
      } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {
        dutyOffList.push({ airman, note: notes || '' });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA'].includes(codeUpper) || statusCategory === 'DUTY') {
        dutyOnList.push({ airman, note: idaShift ? `IDAC ${idaShift}` : notes || dutyCode });
      } else {
        // Other dynamic custom disposal
        const customKey = dutyCode || 'OTHER DISPOSAL';
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        customDisposalsMap[customKey].push({ airman, note: notes });
      }
    });
  } else {
    targetAirmen.forEach((airman) => {
      onPtList.push({ airman });
    });
  }

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

  // Helper to render airman list inside multi-day table cells (without flight tags)
  const renderAirmanColumnList = (list: { airman: Airman }[]) => {
    if (!list || list.length === 0) {
      return <div className="text-center text-slate-400 font-normal py-1">-</div>;
    }
    return (
      <ol className="space-y-0.5 text-[11px] leading-snug font-normal text-left">
        {list.map((item, idx) => (
          <li key={idx} className="whitespace-nowrap">
            {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
          </li>
        ))}
      </ol>
    );
  };

  // Filtered Nominal Status List (from Dashboard)
  const rawPersonnelList = singleParadeData?.personnelStatusList || [];
  const filteredPersonnel = rawPersonnelList.filter((item) => {
    if (selectedFlight !== 'Overall' && item.airman.flightName !== selectedFlight) return false;

    const matchesSearch =
      item.airman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.airman.bdNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.airman.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.airman.trade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      item.statusCategory === statusFilter ||
      (statusFilter === 'BAKE_N_BITE' && (item.dutyCode === 'BAKE_N_BITE' || item.statusCategory === 'BAKE_N_BITE'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Arial, sans-serif !important;
          }
          #official-parade-document {
            font-family: Arial, sans-serif !important;
            font-size: 11px !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Controls Banner (Hidden during print) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>155 UASU BAF • Daily Parade State & Duty Register</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Parade State Document
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between Single-Day Parade State and Multi-Date Disposal Matrix with flight filtering
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Presets */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => handleSetPreset('today')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                !isMultiDay ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleSetPreset('7days')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
            >
              7 Days
            </button>
            <button
              onClick={() => handleSetPreset('15days')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
            >
              15 Days
            </button>
            <button
              onClick={() => handleSetPreset('month')}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
            >
              Month
            </button>
          </div>

          {/* From / To Date Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">
            <span className="text-slate-500 font-semibold">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setSelectedDate(e.target.value);
              }}
              className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
            />
            <span className="text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
            />
          </div>

          {/* Flight Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFlight}
              onChange={(e) => setSelectedFlight(e.target.value as any)}
              className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
            >
              <option value="Overall">Overall ({airmen.length})</option>
              <option value="Avionics">Avionics</option>
              <option value="Mechanics">Mechanics</option>
              <option value="GCS">GCS</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Add Disposal Button (Admin Only) */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setShowAddDisposalModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              title="Add or update personnel disposal (ESSN, CMH, BNS, Sick Report, etc.)"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Disposal</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => (isMultiDay ? fetchMulti() : fetchSingle())}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh Parade Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Official Export / Print Button */}
          <button
            onClick={handleExportOrPrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all border border-slate-700 cursor-pointer"
            title="Generate Official Print/PDF Parade State Document"
          >
            <Printer className="w-4 h-4" />
            <span>Official Export / Print</span>
          </button>

          {/* Download Document Button (Word format) */}
          <button
            onClick={handleDownloadDocx}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Download formatted official document"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Document</span>
          </button>
        </div>
      </div>

      {/* ACTIVE FORMAT INDICATOR BANNER */}
      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-4 py-2 text-xs print:hidden">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-900 dark:text-emerald-200">
            Active Mode: {isMultiDay ? `Multi-Date Parade Matrix (${datesInRange.length} Days)` : `Single-Day Parade State (${formatDateShort(fromDate)})`}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            • Flight: <strong>{selectedFlight}</strong>
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
          {isMultiDay ? 'Select same "From" & "To" date to switch to Single-Day' : 'Select a date range to view Multi-Date matrix'}
        </span>
      </div>

      {/* OFFICIAL PARADE DOCUMENT SHEET (DISPLAYED ON SCREEN & IN PRINT) */}
      <div
        id="official-parade-document"
        className="bg-white text-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg p-6 overflow-x-auto"
      >
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
            <p className="text-sm font-bold">Loading Official Parade State...</p>
          </div>
        ) : isMultiDay ? (
          /* ========================================================================= */
          /* 1. MULTI-DAY PARADE & DUTY DISPOSAL TABLE                                 */
          /* ========================================================================= */
          <div>
            {/* DOCUMENT TOP HEADER */}
            <div className="relative mb-3 text-center flex items-center justify-between" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <Logo155UASU className="w-14 h-16" />
              </div>
              <div className="flex-1 text-center">
                <h1 className="font-bold tracking-wide text-slate-900 underline inline-block text-base uppercase">
                  PARADE STATE & DAILY DUTY REGISTER : AIRMEN
                </h1>
                <br />
                <h2 className="font-bold tracking-wide text-slate-900 mt-0.5 underline inline-block text-sm uppercase">
                  155 UASU BAF {selectedFlight !== 'Overall' ? `(${selectedFlight.toUpperCase()} FLIGHT)` : ''}
                </h2>
              </div>
              <div className="w-28 text-right font-normal text-slate-900 pr-1 text-xs shrink-0">
                Period: {formatDateShort(fromDate)} To {formatDateShort(toDate)}
              </div>
            </div>

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
                    <th className="border border-slate-800 p-1.5" rowSpan={2}>On Parade</th>
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
                    const pList = selectedFlight === 'Overall'
                      ? rawPersonnel
                      : rawPersonnel.filter((s) => s.airman.flightName === selectedFlight);

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
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. SINGLE-DAY OFFICIAL BAF PARADE STATE SHEET                            */
          /* ========================================================================= */
          <div>
            {/* TOP DOCUMENT HEADER */}
            <div className="relative mb-3 text-center flex items-center justify-between" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <Logo155UASU className="w-14 h-16" />
              </div>
              <div className="flex-1 text-center">
                <h1 className="font-bold tracking-wide text-slate-900 underline inline-block text-base uppercase">
                  PARADE STATE : AIRMEN
                </h1>
                <br />
                <h2 className="font-bold tracking-wide text-slate-900 mt-0.5 underline inline-block text-sm uppercase">
                  155 UASU BAF {selectedFlight !== 'Overall' ? `(${selectedFlight.toUpperCase()} FLT)` : ''}
                </h2>
              </div>
              <div className="w-28 text-right font-normal text-slate-900 pr-1 text-xs shrink-0">
                Date: {formatDateShort(fromDate)}
              </div>
            </div>

            {/* SUMMARY MATRIX TABLE: EXACT SINGLE-ROW FORMAT FOR SELECTED FLIGHT / OVERALL */}
            <div className="overflow-x-auto my-1">
              <table
                className="w-full text-center align-middle border-collapse border-2 border-slate-900"
                style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px' }}
              >
                <thead>
                  <tr className="bg-transparent text-slate-900 font-bold border-b-2 border-slate-900">
                    <th className="border border-slate-800 p-0.5 align-middle text-center min-w-[50px] font-bold">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[11px] font-bold">
                        Unit / Flight
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Total str
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Det/ Tdy
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Eff str
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Leave
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Essn
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        BNS/BSH/ CMH
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">
                        Sick Report
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">
                        Drill Cat-C
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Guard Duty On/Off
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Bake & Bite
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">
                        K/O & Reception
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">
                        Admin Order
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">
                        Class/ Trg
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Airfield Duty
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        G/H & Games
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center font-extrabold">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Total Out Parade
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center font-extrabold">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        On Parade
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Absent
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center min-w-[35px]">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        Rmk
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const stats = getFlightStats(selectedFlight);
                    const unitLabel =
                      selectedFlight === 'Overall'
                        ? '155 UASU BAF'
                        : `155 UASU BAF (${selectedFlight.toUpperCase()} FLT)`;

                    return (
                      <tr className="font-bold text-slate-900 border-b-2 border-slate-900 bg-white">
                        <td className="border border-slate-800 p-1.5 text-center font-black whitespace-nowrap">
                          {unitLabel}
                        </td>
                        <td className="border border-slate-800 p-1">{stats.totalStr}</td>
                        <td className="border border-slate-800 p-1">{stats.detTdyCount > 0 ? stats.detTdyCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.effStr}</td>
                        <td className="border border-slate-800 p-1">{stats.leaveCount > 0 ? stats.leaveCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.adminCommCount > 0 ? stats.adminCommCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.classTrgCount > 0 ? stats.classTrgCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.airFdDutyCount > 0 ? stats.airFdDutyCount : '-'}</td>
                        <td className="border border-slate-800 p-1">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                        <td className="border border-slate-800 p-1 font-black bg-slate-100">{stats.totalOutPt}</td>
                        <td className="border border-slate-800 p-1 font-black bg-slate-100">{stats.onPtParadeCount}</td>
                        <td className="border border-slate-800 p-1">{stats.absentCount > 0 ? stats.absentCount : '-'}</td>
                        <td className="border border-slate-800 p-1 text-center">-</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* SPACE BETWEEN 1ST & 2ND TABLE WITH 1PT FONT */}
            <div className="w-full text-center leading-[1px] select-none my-0 py-0" style={{ fontSize: '1px', height: '1px' }}>
              &nbsp;
            </div>

            {/* 2ND TABLE / BOTTOM DISPOSAL SECTION (4-COLUMN STRUCTURED LAYOUT - NO EMPTY HEADINGS) */}
            <div
              className="flex flex-wrap justify-between gap-4 mt-2 pt-1 text-[11px]"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {/* COLUMN 1: ON PARADE (1 TO 15 PER VERTICAL COLUMN) */}
              <div className="flex-1 min-w-[220px]">
                <h3 className="font-bold underline text-slate-900 mb-1.5 uppercase tracking-wide">
                  ON PARADE
                </h3>

                <div className="flex space-x-6">
                  {onPtChunks.length > 0 ? (
                    onPtChunks.map((chunk, colIdx) => (
                      <ol key={colIdx} className="space-y-0.5 font-normal leading-tight">
                        {chunk.map((item) => (
                          <li key={item.airman.id} className="whitespace-nowrap">
                            {item.globalIndex}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                          </li>
                        ))}
                      </ol>
                    ))
                  ) : (
                    <span className="text-slate-400 font-normal">-</span>
                  )}
                </div>
              </div>

              {/* COLUMN 2: LEAVE, BAKE & BITE, ESSN, CMH, SICK REPORT */}
              <div className="w-48 flex flex-col space-y-3">
                {leaveList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      LEAVE
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {leaveList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {bakeBiteList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      BAKE & BITE
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {bakeBiteList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {essnList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      ESSN
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {essnList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {cmhList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      CMH / BNS / BSH
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {cmhList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {sickReportList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      SICK REPORT
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {sickReportList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* COLUMN 3: ATT/TDY/DETT, RECEPTION, AIR FD DUTY, ADMIN ORDER, CLASS/TRG, DRILL CAT-C */}
              <div className="w-48 flex flex-col space-y-3">
                {tdyList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      ATT/TDY/DETT
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {tdyList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {receptionList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      RECEPTION
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {receptionList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {airFdDutyList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      AIR FD DUTY
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {airFdDutyList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {adminOrderList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      ADMIN ORDER
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {adminOrderList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {classTrgList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      CLASS / TRG
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {classTrgList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {drillCatCList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      DRILL CAT-C
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {drillCatCList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* COLUMN 4: DUTY ON, DUTY OFF, G/H & GAMES, ABSENT, CUSTOM DISPOSALS */}
              <div className="w-56 flex flex-col space-y-3">
                {dutyOnList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      DUTY ON
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {dutyOnList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                          {item.note && <span className="text-[9px] text-slate-400 ml-1">({item.note})</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {dutyOffList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      DUTY OFF
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {dutyOffList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                          {item.note && <span className="text-[9px] text-slate-400 ml-1">({item.note})</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {gamesList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      G/H & GAMES
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {gamesList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {absentList.length > 0 && (
                  <div>
                    <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                      ABSENT
                    </h3>
                    <ol className="space-y-0.5 font-normal leading-tight">
                      {absentList.map((item, i) => (
                        <li key={i} className="truncate">
                          {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Additional Dynamic Custom Disposals */}
                {Object.entries(customDisposalsMap).map(([catName, airmenList]) => {
                  if (!airmenList || airmenList.length === 0) return null;
                  return (
                    <div key={catName}>
                      <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                        {catName}
                      </h3>
                      <ol className="space-y-0.5 font-normal leading-tight">
                        {airmenList.map((item, i) => (
                          <li key={i} className="truncate">
                            {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                            {item.note && <span className="text-[9px] text-slate-400 ml-1">({item.note})</span>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SPACER ROW: 0.6 INCH HEIGHT TO PROVIDE SIGNATURE HEADROOM */}
            <div className="w-full" style={{ height: '0.6in' }} />

            {/* OFFICIAL SIGNATURE FOOTER */}
            <div
              className="flex justify-between items-end pt-1 text-slate-900 text-xs"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {/* LEFT SIGNATURE BLOCK */}
              <div className="text-center font-bold min-w-[200px]">
                <div className="border-t border-slate-900 pt-1.5">
                  <div className="text-xs uppercase font-black">{leftSigName}</div>
                  <div className="text-[11px] font-bold uppercase">{leftSigRank}</div>
                  <div className="text-[11px] font-normal">{leftSigDesig}</div>
                  <div className="text-[10px] font-normal">155 UASU BAF</div>
                </div>
              </div>

              {/* RIGHT SIGNATURE BLOCK */}
              <div className="text-center font-bold min-w-[200px]">
                <div className="border-t border-slate-900 pt-1.5">
                  <div className="text-xs uppercase font-black">{rightSigName}</div>
                  <div className="text-[11px] font-bold uppercase">{rightSigRank}</div>
                  <div className="text-[11px] font-normal">{rightSigDesig}</div>
                  <div className="text-[10px] font-normal">155 UASU BAF</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE NOMINAL STATUS REGISTER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden print:hidden">
        {/* Header Toggle */}
        <div
          onClick={() => setShowNominalSection(!showNominalSection)}
          className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Nominal Status List & Personnel Duty Assignment ({filteredPersonnel.length} Airmen)
            </h3>
            {selectedFlight !== 'Overall' && (
              <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                {selectedFlight} Flight
              </span>
            )}
          </div>
          <button className="p-1 rounded-lg text-slate-500">
            {showNominalSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showNominalSection && (
          <div className="p-4 space-y-4">
            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search BD No, Name, Trade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none w-56 focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {(['ALL', 'PARADE', 'DUTY', 'LEAVE', 'TDY', 'BAKE_N_BITE'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st === 'BAKE_N_BITE' ? 'Bake N Bite' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {filteredPersonnel.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs font-semibold">No airmen match the selected criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4 w-12">Ser</th>
                      <th className="py-3 px-4">BD No</th>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Trade</th>
                      <th className="py-3 px-4">Flight</th>
                      <th className="py-3 px-4">Current Status / Duty</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {filteredPersonnel.map(({ airman, dutyCode, idaShift, statusCategory, notes }) => {
                      const dutyType = DUTY_TYPE_MAP.get(dutyCode as any);

                      return (
                        <tr
                          key={airman.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono font-medium text-slate-400">
                            {airman.serNo}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {airman.bdNo}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-extrabold px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono border border-slate-300 dark:border-slate-700">
                              {airman.rank}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              onClick={() => onViewAirmanProfile && onViewAirmanProfile(airman)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                            >
                              {airman.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                            {airman.trade}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {airman.flightName}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center space-x-1 ${
                                  dutyType ? dutyType.badgeBg + ' ' + dutyType.badgeText : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                <span>{dutyType ? dutyType.name : dutyCode}</span>
                                {idaShift && idaShift !== 'None' && (
                                  <span className="text-[10px] font-extrabold underline decoration-emerald-500 ml-1">
                                    ({idaShift})
                                  </span>
                                )}
                              </span>
                              {notes && (
                                <span className="text-[11px] text-slate-400 italic">
                                  "{notes}"
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {role === 'ADMIN' && (
                                <button
                                  onClick={() =>
                                    setActiveEditCell({
                                      airman,
                                      date: fromDate,
                                      dutyCode: dutyCode as DutyCategoryCode,
                                      idaShift: idaShift as IDAShift,
                                      notes,
                                    })
                                  }
                                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all flex items-center space-x-1 shrink-0 cursor-pointer"
                                  title={`Assign or edit duty for ${airman.rank} ${airman.name}`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Assign</span>
                                </button>
                              )}
                              {onViewAirmanProfile && (
                                <button
                                  onClick={() => onViewAirmanProfile(airman)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
                                  title={`View profile for ${airman.rank} ${airman.name}`}
                                >
                                  <Eye className="w-3 h-3 text-slate-500" />
                                  <span>Profile</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row Edit Popover */}
      {activeEditCell && (
        <DutyCellPopover
          airmanName={`${activeEditCell.airman.rank} ${activeEditCell.airman.name}`}
          airmanFlight={activeEditCell.airman.flightName}
          date={activeEditCell.date}
          currentCode={activeEditCell.dutyCode}
          currentIdaShift={activeEditCell.idaShift}
          currentProxyForFlight={activeEditCell.proxyForFlight}
          currentNotes={activeEditCell.notes}
          onSelectDuty={handleSaveSingleRowDuty}
          onDeleteDuty={handleDeleteRowDuty}
          onClose={() => setActiveEditCell(null)}
        />
      )}

      {/* Add Disposal Modal */}
      {showAddDisposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Add Personnel Disposal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assign non-routine disposals (ESSN, CMH, Sick Report, Drill Cat C, Leave, Bake & Bite, etc.).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddDisposalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message */}
            {disposalSuccessMsg && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold animate-fadeIn">
                {disposalSuccessMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddDisposalSubmit} className="space-y-4">
              {/* 1. Date Selection with Single/Multi Toggle */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. Select Date Range
                  </label>
                  <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setDisposalDateMode('SINGLE');
                        setDisposalToDate(disposalFromDate);
                      }}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        disposalDateMode === 'SINGLE'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Single Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisposalDateMode('MULTI')}
                      className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        disposalDateMode === 'MULTI'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Multi Date
                    </button>
                  </div>
                </div>

                {disposalDateMode === 'SINGLE' ? (
                  <div>
                    <input
                      type="date"
                      value={disposalFromDate}
                      onChange={(e) => {
                        setDisposalFromDate(e.target.value);
                        setDisposalToDate(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block mb-1">From Date:</span>
                      <input
                        type="date"
                        value={disposalFromDate}
                        onChange={(e) => {
                          setDisposalFromDate(e.target.value);
                          if (!disposalToDate || disposalToDate < e.target.value) {
                            setDisposalToDate(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block mb-1">To Date:</span>
                      <input
                        type="date"
                        value={disposalToDate}
                        min={disposalFromDate}
                        onChange={(e) => setDisposalToDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Select Disposal Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Select Disposal Category
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {[
                    { code: 'ESSN', label: 'ESSN (Essential)' },
                    { code: 'CMH', label: 'CMH / BNS / BSH' },
                    { code: 'SICK_REPORT', label: 'Sick Report / ED' },
                    { code: 'DRILL_CAT_C', label: "Drill Cat 'C'" },
                    { code: 'LEAVE', label: 'Leave (Casual/Ann)' },
                    { code: 'BAKE_N_BITE', label: 'Bake & Bite' },
                    { code: 'RECEPTION', label: 'Reception / K/O' },
                    { code: 'TDY', label: 'ATT / TDY / DETT' },
                    { code: 'ADMIN_ORDER', label: 'Admin Order / BOI' },
                    { code: 'CLASS_TRG', label: 'Class / Trg Ctrl' },
                    { code: 'AIRFIELD_DUTY', label: 'Airfield Duty' },
                    { code: 'GAMES', label: 'G/H & Games' },
                    { code: 'ABSENT', label: 'Absent / AWL' },
                    { code: 'OTHERS', label: '✨ Other Custom' },
                  ].map((cat) => {
                    const isSelected = disposalCategory === cat.code;
                    return (
                      <button
                        key={cat.code}
                        type="button"
                        onClick={() => setDisposalCategory(cat.code)}
                        className={`p-2 rounded-xl text-xs font-bold text-left border transition-all truncate cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Title Input if OTHERS */}
                {disposalCategory === 'OTHERS' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Specify Custom Disposal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Escort, VVIP Detail, Flood Cell..."
                      value={disposalCustomTitle}
                      onChange={(e) => setDisposalCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-xs"
                      required
                    />
                  </div>
                )}
              </div>

              {/* 3. Flight Filter & Airman Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    3. Select Flight & Personnel
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setDisposalFlight(fl)}
                      className={`py-1 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        disposalFlight === fl
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>

                {/* Airman Select */}
                <select
                  value={disposalAirmanId}
                  onChange={(e) => setDisposalAirmanId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 cursor-pointer"
                  required
                >
                  <option value="" disabled className="text-slate-400">
                    -- Select Personnel in {disposalFlight} Flight --
                  </option>
                  {airmen
                    .filter((a) => a.flightName === disposalFlight)
                    .map((a) => (
                      <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900">
                        {a.rank} {a.name} ({a.trade})
                      </option>
                    ))}
                </select>
              </div>

              {/* 4. Notes / Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  4. Remarks / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CMH Ward-4, Approved by OC, Order No..."
                  value={disposalNotes}
                  onChange={(e) => setDisposalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDisposalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disposalLoading || !disposalAirmanId}
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {disposalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Add Disposal Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flight Duty Ratio Configurator Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          date={fromDate}
          onClose={() => setShowRatioModal(false)}
          onRatiosUpdated={() => setRatioRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* Internal Printable Parade State Modal (Fallback) */}
      {isInternalPrintOpen && (
        <PrintableParadeStateModal
          date={fromDate}
          shift="Morning"
          flight={selectedFlight}
          airmen={airmen}
          onClose={() => setIsInternalPrintOpen(false)}
        />
      )}
    </div>
  );
};
