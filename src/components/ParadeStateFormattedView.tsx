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
import { formatDutyOnShortName, formatDutyOffShortName } from '../utils/dutyFormatter';
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
  Sparkles,
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
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
}

export const ParadeStateFormattedView: React.FC<ParadeStateFormattedViewProps> = ({
  role = 'ADMIN',
  selectedDate,
  setSelectedDate,
  airmen,
  initialDocumentType = 'PARADE',
  onOpenPrintModal,
  onViewAirmanProfile,
  onOpenImportModal,
}) => {
  const isPtDocument = initialDocumentType === 'PT';
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
  const [selectedDisposalAirmenIds, setSelectedDisposalAirmenIds] = useState<string[]>([]);
  const [disposalPersonnelStatusMap, setDisposalPersonnelStatusMap] = useState<Record<string, { statusCategory: string; dutyCode: string; notes?: string; dutyName?: string }>>({});
  const [disposalFromDate, setDisposalFromDate] = useState<string>(selectedDate);
  const [disposalToDate, setDisposalToDate] = useState<string>(selectedDate);
  const [disposalScope, setDisposalScope] = useState<'ALL' | 'PARADE' | 'PT'>('ALL');
  const [disposalNotes, setDisposalNotes] = useState<string>('');
  const [disposalLoading, setDisposalLoading] = useState<boolean>(false);
  const [disposalSuccessMsg, setDisposalSuccessMsg] = useState<string>('');

  // Edit / Change Disposal Modal State
  const [editDisposalModal, setEditDisposalModal] = useState<{
    airman: Airman;
    date: string;
    currentDutyCode: string;
    currentDutyName?: string;
    notes?: string;
  } | null>(null);
  const [editDisposalCategory, setEditDisposalCategory] = useState<string>('LEAVE');
  const [editDisposalCustomTitle, setEditDisposalCustomTitle] = useState<string>('');
  const [editDisposalFromDate, setEditDisposalFromDate] = useState<string>(selectedDate);
  const [editDisposalToDate, setEditDisposalToDate] = useState<string>(selectedDate);
  const [editDisposalLoading, setEditDisposalLoading] = useState<boolean>(false);

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

  // Fetch personnel status for disposal fromDate
  useEffect(() => {
    if (!showAddDisposalModal || !disposalFromDate) return;
    fetch(`/api/parade-state?date=${disposalFromDate}&shift=Morning`)
      .then((r) => r.json())
      .then((data: ParadeStateResponse) => {
        const map: Record<string, { statusCategory: string; dutyCode: string; notes?: string; dutyName?: string }> = {};
        (data?.personnelStatusList || []).forEach((item) => {
          map[item.airman.id] = {
            statusCategory: item.statusCategory,
            dutyCode: item.dutyCode,
            notes: item.notes,
            dutyName: item.dutyName,
          };
        });
        setDisposalPersonnelStatusMap(map);
      })
      .catch((err) => console.error('Failed to fetch disposal personnel statuses:', err));
  }, [showAddDisposalModal, disposalFromDate]);

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
      const stateType = isPtDocument ? 'PT' : 'PARADE';
      const res = await fetch(`/api/parade-state?date=${fromDate}&shift=Morning&flight=Overall&stateType=${stateType}`);
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
      const stateType = isPtDocument ? 'PT' : 'PARADE';
      const results = await Promise.all(
        datesInRange.map((dStr) =>
          fetch(`/api/parade-state?date=${dStr}&shift=Morning&flight=Overall&stateType=${stateType}`)
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
  }, [fromDate, toDate, isPtDocument]);

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

  // Handle Add Disposal submit (multi-person support)
  const handleAddDisposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisposalAirmenIds.length === 0 || !disposalFromDate || !disposalToDate) return;

    setDisposalLoading(true);
    setDisposalSuccessMsg('');
    try {
      const isCustom = disposalCategory === 'OTHERS';
      const effectiveDutyCode = isCustom ? 'OTHERS' : disposalCategory;
      const effectiveNotes = isCustom ? (disposalCustomTitle.trim() || 'Custom Disposal') : undefined;

      const promises = selectedDisposalAirmenIds.map((airmanId) =>
        fetch('/api/roster/assign-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airmanId,
            dutyCode: effectiveDutyCode,
            fromDate: disposalFromDate,
            toDate: disposalToDate,
            disposalScope: 'ALL',
            notes: effectiveNotes,
          }),
        }).then((r) => r.json().catch(() => ({})))
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        setDisposalSuccessMsg(`✅ Disposal assigned to ${successCount} personnel successfully!`);
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
        setTimeout(() => {
          setShowAddDisposalModal(false);
          setDisposalSuccessMsg('');
          setSelectedDisposalAirmenIds([]);
        }, 1200);
      } else {
        alert('Failed to add disposal for selected personnel');
      }
    } catch (err: any) {
      console.error('Failed to submit disposal:', err);
      alert(`Error adding disposal: ${err?.message || 'Network request failed'}`);
    } finally {
      setDisposalLoading(false);
    }
  };

  // Open Edit / Change Disposal Modal for a specific airman
  const openEditDisposal = (airman: Airman, dutyCode: string, dutyName?: string, note?: string) => {
    const isStandardCat = [
      'ESSN',
      'CMH',
      'SICK_REPORT',
      'DRILL_CAT_C',
      'LEAVE',
      'BAKE_N_BITE',
      'RECEPTION',
      'TDY',
      'ADMIN_ORDER',
      'CLASS_TRG',
      'AIRFIELD_DUTY',
      'GAMES',
      'ABSENT',
      'DUTY_ON',
      'DUTY_OFF',
    ].includes(dutyCode);

    setEditDisposalModal({
      airman,
      date: fromDate,
      currentDutyCode: dutyCode,
      currentDutyName: dutyName || dutyCode,
      notes: note,
    });
    setEditDisposalCategory(isStandardCat ? dutyCode : 'OTHERS');
    setEditDisposalCustomTitle(!isStandardCat ? (dutyName || note || dutyCode || '') : '');
    setEditDisposalFromDate(fromDate);
    setEditDisposalToDate(isMultiDay ? toDate : fromDate);
  };

  // Save changes to edited disposal
  const handleSaveEditDisposal = async () => {
    if (!editDisposalModal || !editDisposalFromDate || !editDisposalToDate) return;
    setEditDisposalLoading(true);
    try {
      if (editDisposalCategory === 'ON_PARADE') {
        // If changed to On Parade, clear disposal
        await handleDeleteEditDisposal();
        return;
      }

      const isCustom = editDisposalCategory === 'OTHERS';
      const effectiveDutyCode = isCustom ? 'OTHERS' : editDisposalCategory;
      const effectiveNotes = isCustom ? (editDisposalCustomTitle.trim() || 'Custom Disposal') : undefined;

      const res = await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: editDisposalModal.airman.id,
          dutyCode: effectiveDutyCode,
          fromDate: editDisposalFromDate,
          toDate: editDisposalToDate,
          disposalScope: 'ALL',
          notes: effectiveNotes,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
        setEditDisposalModal(null);
      } else {
        alert('Failed to update disposal');
      }
    } catch (err: any) {
      console.error('Failed to update disposal:', err);
      alert(`Error updating disposal: ${err?.message || 'Network error'}`);
    } finally {
      setEditDisposalLoading(false);
    }
  };

  // Delete / Clear disposal (Revert to On Parade)
  const handleDeleteEditDisposal = async () => {
    if (!editDisposalModal || !editDisposalFromDate || !editDisposalToDate) return;
    setEditDisposalLoading(true);
    try {
      const res = await fetch('/api/roster/delete-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: editDisposalModal.airman.id,
          fromDate: editDisposalFromDate,
          toDate: editDisposalToDate,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (isMultiDay) await fetchMulti();
        else await fetchSingle();
        setEditDisposalModal(null);
      } else {
        alert('Failed to remove disposal');
      }
    } catch (err: any) {
      console.error('Failed to delete disposal:', err);
      alert(`Error deleting disposal: ${err?.message || 'Network error'}`);
    } finally {
      setEditDisposalLoading(false);
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
        documentType: isPtDocument ? 'PT' : 'PARADE',
        stats,
        onParade: onPtList.map((i) => i.airman),
        leave: leaveList.map((i) => i.airman),
        bakeBite: bakeBiteList.map((i) => i.airman),
        tdy: tdyList.map((i) => i.airman),
        reception: receptionList.map((i) => i.airman),
        dutyOn: dutyOnList,
        dutyOff: dutyOffList,
        airFdDuty: airFdDutyList.map((i) => i.airman),
        essn: essnList.map((i) => i.airman),
        cmh: cmhList.map((i) => i.airman),
        sickReport: sickReportList.map((i) => i.airman),
        drillCatC: drillCatCList.map((i) => i.airman),
        adminOrder: adminOrderList.map((i) => i.airman),
        classTrg: classTrgList.map((i) => i.airman),
        games: gamesList.map((i) => i.airman),
        absent: absentList.map((i) => i.airman),
        otherDisposals,
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
        onPtList.push({ airman, note: '' });
      } else if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
        leaveList.push({ airman, note: '' });
      } else if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
        essnList.push({ airman, note: 'ESSN' });
      } else if (['CMH', 'BNS', 'BSH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh') || notesLower.includes('bns') || notesLower.includes('bsh')) {
        cmhList.push({ airman, note: 'CMH' });
      } else if (['SICK_REPORT', 'SICK', 'EX_PPGF', 'ED'].includes(codeUpper) || notesLower.includes('sick') || notesLower.includes('ppgf')) {
        sickReportList.push({ airman, note: 'Sick Report' });
      } else if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper) || notesLower.includes('drill')) {
        drillCatCList.push({ airman, note: "Drill Cat 'C'" });
      } else if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
        tdyList.push({ airman, note: 'TDY' });
      } else if (['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE') {
        bakeBiteList.push({ airman, note: 'Bake & Bite' });
      } else if (codeUpper === 'RECEPTION' || notesLower.includes('reception') || notesLower.includes('k/o')) {
        receptionList.push({ airman, note: 'Reception' });
      } else if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'AIRFIELD_DUTY'].includes(codeUpper) || notesLower.includes('air fd') || notesLower.includes('airfield')) {
        airFdDutyList.push({ airman, note: 'Air Fd Duty' });
      } else if (['ADMIN_ORDER', 'BOI', 'COMMITTEE'].includes(codeUpper) || notesLower.includes('admin order') || notesLower.includes('boi')) {
        adminOrderList.push({ airman, note: 'Admin Order' });
      } else if (['CLASS_TRG', 'CLASS', 'TRG', 'LTTB'].includes(codeUpper) || notesLower.includes('class') || notesLower.includes('trg')) {
        classTrgList.push({ airman, note: 'Class/Trg' });
      } else if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper) || notesLower.includes('games') || notesLower.includes('g/h')) {
        gamesList.push({ airman, note: 'G/H & Games' });
      } else if (['ABSENT', 'AWL', 'OSL'].includes(codeUpper) || notesLower.includes('absent')) {
        absentList.push({ airman, note: 'Absent' });
      } else if (codeUpper === 'DUTY_OFF' || statusCategory === 'OFF') {
        const offName = formatDutyOffShortName(item.previousDutyCode, item.previousDutyName, item.dutyName || notes);
        dutyOffList.push({ airman, note: offName });
      } else if (['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'AIRPORT', 'AIRFIELD', 'AIRFIELD_DUTY', 'AIR_FD'].includes(codeUpper) || statusCategory === 'DUTY') {
        const dutyDisplay = formatDutyOnShortName(codeUpper, idaShift, notes, item.dutyName);
        dutyOnList.push({ airman, note: dutyDisplay });
      } else {
        // Other dynamic custom disposal
        const customKey = dutyCode || 'OTHER DISPOSAL';
        if (!customDisposalsMap[customKey]) customDisposalsMap[customKey] = [];
        const safeNotes = notes && !notes.toLowerCase().includes('imported') ? notes : undefined;
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

  // Helper to render interactive disposal list items (with ✏️ edit click for admin)
  const renderDisposalAirmenList = (
    list: { airman: Airman; note?: string }[],
    dutyCode: string,
    dutyName: string
  ) => {
    return (
      <ol className="space-y-0.5 font-normal leading-tight">
        {list.map((item, i) => {
          const isDutyOn = dutyCode === 'DUTY_ON' || ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA', 'AIRPORT'].includes(dutyCode);
          const isDutyOff = dutyCode === 'DUTY_OFF';
          let noteText = item.note && !item.note.toLowerCase().includes('imported') ? item.note : '';

          return (
            <li
              key={item.airman.id || i}
              onClick={() => {
                if (role === 'ADMIN') {
                  openEditDisposal(item.airman, dutyCode, dutyName, item.note);
                }
              }}
              className={`truncate group flex items-center justify-between ${
                role === 'ADMIN'
                  ? 'cursor-pointer hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 px-1 rounded transition-colors'
                  : ''
              }`}
              title={role === 'ADMIN' ? 'Click to edit, change or remove disposal' : undefined}
            >
              <span className="truncate">
                {i + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                {(isDutyOn || isDutyOff) && noteText ? (
                  <span className="text-slate-800 dark:text-slate-200 font-medium"> - {noteText}</span>
                ) : noteText && noteText !== dutyName && noteText !== dutyCode ? (
                  <span className="text-[9px] text-slate-400 ml-1">({noteText})</span>
                ) : null}
              </span>
              {role === 'ADMIN' && (
                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-purple-600 font-bold ml-1 shrink-0 print:hidden">
                  ✏️
                </span>
              )}
            </li>
          );
        })}
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
            {isPtDocument ? 'PT State Document' : 'Parade State Document'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between Single-Day {isPtDocument ? 'PT State' : 'Parade State'} and Multi-Date Disposal Matrix with flight filtering
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isPtDocument ? (
            /* PT STATE: SINGLE DATE + FLIGHT FILTER */
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">
                <span className="text-slate-500 font-semibold">Date:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setToDate(e.target.value);
                    setSelectedDate(e.target.value);
                  }}
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
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* Add Disposal Button (Admin Only) */}
          {role === 'ADMIN' && (
            <button
              onClick={() => {
                if (isPtDocument) {
                  setDisposalScope('PT');
                  setDisposalDateMode('SINGLE');
                } else {
                  setDisposalScope('ALL');
                }
                setShowAddDisposalModal(true);
              }}
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

          {/* Import PDF / Duty Data Button (Admin) */}
          {role === 'ADMIN' && onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Import Duty Roster from PDF / Image using AI"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Import PDF Data</span>
            </button>
          )}

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
                    <th className="border border-slate-800 p-1.5" rowSpan={2}>{isPtDocument ? 'On PT' : 'On Parade'}</th>
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
                  {isPtDocument ? 'PT STATE : AIRMEN' : 'PARADE STATE : AIRMEN'}
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
                        {isPtDocument ? 'Total Out PT' : 'Total Out Parade'}
                      </div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center font-extrabold">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">
                        {isPtDocument ? 'On PT' : 'On Parade'}
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

            {/* 2ND TABLE / BOTTOM DISPOSAL SECTION */}
            <div
              className="mt-2 pt-1 text-[11px]"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                {/* 1ST COLUMN: ON PARADE / ON PT (1 TO 15 ON LEFT, 16+ ON RIGHT, NIL IF EMPTY) */}
                <div className="min-w-[240px] flex-shrink-0">
                  <h3 className="font-bold underline text-slate-900 mb-1.5 uppercase tracking-wide">
                    {isPtDocument ? 'ON PT' : 'ON PARADE'}
                  </h3>

                  {onPtList.length > 0 ? (
                    <div className="flex items-start space-x-6">
                      {/* Left side: 1 to 15 */}
                      <ol className="space-y-0.5 font-normal leading-tight">
                        {onPtList.slice(0, 15).map((item, idx) => (
                          <li key={item.airman.id} className="whitespace-nowrap">
                            {idx + 1}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                          </li>
                        ))}
                      </ol>

                      {/* Right side: 16+ */}
                      {onPtList.length > 15 && (
                        <ol className="space-y-0.5 font-normal leading-tight">
                          {onPtList.slice(15, 30).map((item, idx) => (
                            <li key={item.airman.id} className="whitespace-nowrap">
                              {16 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Extra column if > 30 */}
                      {onPtList.length > 30 && (
                        <ol className="space-y-0.5 font-normal leading-tight">
                          {onPtList.slice(30).map((item, idx) => (
                            <li key={item.airman.id} className="whitespace-nowrap">
                              {31 + idx}. {item.airman.rank} {formatAirmanName(item.airman.name)}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ) : (
                    <div className="font-bold text-slate-900">Nil</div>
                  )}
                </div>

                {/* DISPOSALS (ONLY SHOWN IF NOT EMPTY / >0 AIRMEN, NO EMPTY HEADINGS) */}
                <div className="flex-1 flex flex-wrap gap-5">
                  {/* DISPOSAL COL A */}
                  {(leaveList.length > 0 || dutyOnList.length > 0 || (!isPtDocument && dutyOffList.length > 0) || bakeBiteList.length > 0 || essnList.length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {leaveList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            LEAVE
                          </h3>
                          {renderDisposalAirmenList(leaveList, 'LEAVE', 'Leave')}
                        </div>
                      )}

                      {dutyOnList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            DUTY ON
                          </h3>
                          {renderDisposalAirmenList(dutyOnList, 'DUTY_ON', 'Duty On')}
                        </div>
                      )}

                      {!isPtDocument && dutyOffList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            DUTY OFF
                          </h3>
                          {renderDisposalAirmenList(dutyOffList, 'DUTY_OFF', 'Duty Off')}
                        </div>
                      )}

                      {bakeBiteList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            BAKE & BITE
                          </h3>
                          {renderDisposalAirmenList(bakeBiteList, 'BAKE_N_BITE', 'Bake & Bite')}
                        </div>
                      )}

                      {essnList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            ESSN
                          </h3>
                          {renderDisposalAirmenList(essnList, 'ESSN', 'ESSN')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPOSAL COL B */}
                  {(cmhList.length > 0 || sickReportList.length > 0 || tdyList.length > 0 || receptionList.length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {cmhList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            CMH / BNS / BSH
                          </h3>
                          {renderDisposalAirmenList(cmhList, 'CMH', 'CMH / Hospital')}
                        </div>
                      )}

                      {sickReportList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            SICK REPORT
                          </h3>
                          {renderDisposalAirmenList(sickReportList, 'SICK_REPORT', 'Sick Report')}
                        </div>
                      )}

                      {tdyList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            ATT/TDY/DETT
                          </h3>
                          {renderDisposalAirmenList(tdyList, 'TDY', 'ATT / TDY / DETT')}
                        </div>
                      )}

                      {receptionList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            RECEPTION
                          </h3>
                          {renderDisposalAirmenList(receptionList, 'RECEPTION', 'Reception')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPOSAL COL C */}
                  {(airFdDutyList.length > 0 || adminOrderList.length > 0 || classTrgList.length > 0 || drillCatCList.length > 0 || gamesList.length > 0 || absentList.length > 0 || Object.keys(customDisposalsMap).length > 0) && (
                    <div className="w-48 flex flex-col space-y-3">
                      {airFdDutyList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            AIR FD DUTY
                          </h3>
                          {renderDisposalAirmenList(airFdDutyList, 'AIRFIELD_DUTY', 'Air Fd Duty')}
                        </div>
                      )}

                      {adminOrderList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            ADMIN ORDER
                          </h3>
                          {renderDisposalAirmenList(adminOrderList, 'ADMIN_ORDER', 'Admin Order')}
                        </div>
                      )}

                      {classTrgList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            CLASS / TRG
                          </h3>
                          {renderDisposalAirmenList(classTrgList, 'CLASS_TRG', 'Class / TRG')}
                        </div>
                      )}

                      {drillCatCList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            DRILL CAT-C
                          </h3>
                          {renderDisposalAirmenList(drillCatCList, 'DRILL_CAT_C', 'Drill Cat-C')}
                        </div>
                      )}

                      {gamesList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            G/H & GAMES
                          </h3>
                          {renderDisposalAirmenList(gamesList, 'GAMES', 'G/H & Games')}
                        </div>
                      )}

                      {absentList.length > 0 && (
                        <div>
                          <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                            ABSENT
                          </h3>
                          {renderDisposalAirmenList(absentList, 'ABSENT', 'Absent')}
                        </div>
                      )}

                      {/* Dynamic Custom Disposals / Others */}
                      {Object.entries(customDisposalsMap).map(([catName, airmenList]) => {
                        if (!airmenList || airmenList.length === 0) return null;
                        return (
                          <div key={catName}>
                            <h3 className="font-bold underline text-slate-900 mb-1 uppercase tracking-wide">
                              {catName}
                            </h3>
                            {renderDisposalAirmenList(airmenList, 'OTHERS', catName)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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

                {/* Multi-Select Airmen List */}
                {(() => {
                  const flightAirmen = airmen.filter((a) => a.flightName === disposalFlight);

                  const getAirmanStatusLabel = (airmanId: string) => {
                    const st = disposalPersonnelStatusMap[airmanId];
                    if (!st) return { isOnParade: true, label: 'On Parade', dutyCode: 'ON_PARADE', notes: '', dutyName: 'On Parade' };

                    const { statusCategory, dutyCode, notes, dutyName } = st;
                    const codeUpper = (dutyCode || '').toUpperCase();
                    const notesLower = (notes || '').toLowerCase();

                    if (codeUpper === 'ON_PARADE' || statusCategory === 'PARADE') {
                      return { isOnParade: true, label: 'On Parade', dutyCode: 'ON_PARADE', notes, dutyName: 'On Parade' };
                    }
                    if (codeUpper === 'LEAVE' || statusCategory === 'LEAVE') {
                      return { isOnParade: false, label: 'Leave', dutyCode: 'LEAVE', notes, dutyName: 'Leave' };
                    }
                    if (['TDY', 'ATT', 'DETT', 'ATTACHMENT', 'DETACHMENT'].includes(codeUpper) || statusCategory === 'TDY') {
                      return { isOnParade: false, label: 'TDY', dutyCode: 'TDY', notes, dutyName: 'TDY' };
                    }
                    if (['BAKE_BITE', 'BAKE_N_BITE'].includes(codeUpper) || statusCategory === 'BAKE_N_BITE') {
                      return { isOnParade: false, label: 'Bake & Bite', dutyCode: 'BAKE_N_BITE', notes, dutyName: 'Bake & Bite' };
                    }
                    if (codeUpper === 'ESSN' || notesLower.includes('essn')) {
                      return { isOnParade: false, label: 'ESSN', dutyCode: 'ESSN', notes, dutyName: 'ESSN' };
                    }
                    if (['CMH', 'BNS', 'BSH', 'HOSPITAL'].includes(codeUpper) || notesLower.includes('cmh') || notesLower.includes('bns') || notesLower.includes('bsh')) {
                      return { isOnParade: false, label: 'CMH / Hospital', dutyCode: 'CMH', notes, dutyName: 'CMH / Hospital' };
                    }
                    if (['SICK_REPORT', 'SICK', 'EX_PPGF', 'ED'].includes(codeUpper) || notesLower.includes('sick')) {
                      return { isOnParade: false, label: 'Sick Report', dutyCode: 'SICK_REPORT', notes, dutyName: 'Sick Report' };
                    }
                    if (['DRILL_CAT_C', 'CAT_C', 'DRILL'].includes(codeUpper)) {
                      return { isOnParade: false, label: "Drill Cat 'C'", dutyCode: 'DRILL_CAT_C', notes, dutyName: "Drill Cat 'C'" };
                    }
                    if (codeUpper === 'RECEPTION' || notesLower.includes('reception')) {
                      return { isOnParade: false, label: 'Reception / KO', dutyCode: 'RECEPTION', notes, dutyName: 'Reception / KO' };
                    }
                    if (['ADMIN_ORDER', 'BOI'].includes(codeUpper) || notesLower.includes('admin order')) {
                      return { isOnParade: false, label: 'Admin Order', dutyCode: 'ADMIN_ORDER', notes, dutyName: 'Admin Order' };
                    }
                    if (['CLASS_TRG', 'CLASS', 'TRG'].includes(codeUpper)) {
                      return { isOnParade: false, label: 'Class / Trg', dutyCode: 'CLASS_TRG', notes, dutyName: 'Class / Trg' };
                    }
                    if (['AIRPORT', 'AIR_FD', 'AIRFIELD', 'AIRFIELD_DUTY'].includes(codeUpper)) {
                      return { isOnParade: false, label: 'Airfield Duty', dutyCode: 'AIRFIELD_DUTY', notes, dutyName: 'Airfield Duty' };
                    }
                    if (['GAMES', 'GH', 'GAME_HONOR'].includes(codeUpper)) {
                      return { isOnParade: false, label: 'G/H & Games', dutyCode: 'GAMES', notes, dutyName: 'G/H & Games' };
                    }
                    if (['ABSENT', 'AWL'].includes(codeUpper)) {
                      return { isOnParade: false, label: 'Absent', dutyCode: 'ABSENT', notes, dutyName: 'Absent' };
                    }
                    if (statusCategory === 'OFF' || codeUpper === 'DUTY_OFF') {
                      return { isOnParade: false, label: dutyName || notes || 'Duty Off', dutyCode: 'DUTY_OFF', notes, dutyName: dutyName || 'Duty Off' };
                    }
                    if (statusCategory === 'DUTY' || ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'IDAC', 'IDA'].includes(codeUpper)) {
                      return { isOnParade: false, label: notes || dutyCode || 'On Duty', dutyCode: dutyCode || 'DUTY_ON', notes, dutyName: dutyName || 'On Duty' };
                    }

                    return { isOnParade: false, label: notes || dutyCode || 'Disposal', dutyCode: dutyCode || 'OTHERS', notes, dutyName: dutyName || 'Disposal' };
                  };

                  const availableOnParade = flightAirmen.filter((a) => getAirmanStatusLabel(a.id).isOnParade);

                  const handleSelectAllFlightAvailable = () => {
                    const availableIds = availableOnParade.map((a) => a.id);
                    setSelectedDisposalAirmenIds((prev) => Array.from(new Set([...prev, ...availableIds])));
                  };

                  const handleDeselectFlight = () => {
                    const flightIds = flightAirmen.map((a) => a.id);
                    setSelectedDisposalAirmenIds((prev) => prev.filter((id) => !flightIds.includes(id)));
                  };

                  return (
                    <div className="space-y-1.5">
                      {/* Selection Toolbar */}
                      <div className="flex items-center justify-between px-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Available: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{availableOnParade.length}</strong> / {flightAirmen.length} in {disposalFlight}
                          {selectedDisposalAirmenIds.length > 0 && (
                            <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                              ({selectedDisposalAirmenIds.length} Selected)
                            </span>
                          )}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleSelectAllFlightAvailable}
                            disabled={availableOnParade.length === 0}
                            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-40 cursor-pointer"
                          >
                            Select All Available
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            type="button"
                            onClick={handleDeselectFlight}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Airmen List Scrollbox */}
                      <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {flightAirmen.length === 0 ? (
                          <div className="py-4 text-center text-xs text-slate-400">
                            No airmen registered in {disposalFlight} Flight
                          </div>
                        ) : (
                          flightAirmen.map((a) => {
                            const statusInfo = getAirmanStatusLabel(a.id);
                            const { isOnParade, label: statusLabel } = statusInfo;
                            const isChecked = selectedDisposalAirmenIds.includes(a.id);

                            if (isOnParade) {
                              return (
                                <label
                                  key={a.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                                    isChecked
                                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-950 dark:text-purple-100 font-bold shadow-xs'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedDisposalAirmenIds((prev) => prev.filter((id) => id !== a.id));
                                        } else {
                                          setSelectedDisposalAirmenIds((prev) => [...prev, a.id]);
                                        }
                                      }}
                                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="truncate">
                                      <span className="font-bold text-slate-900 dark:text-white">{a.rank}</span> {a.name} <span className="text-[11px] text-slate-400">({a.trade})</span>
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2">
                                    On Parade
                                  </span>
                                </label>
                              );
                            }

                            // Airman with existing disposal / duty - with Edit / Change button
                            return (
                              <div
                                key={a.id}
                                className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 text-xs select-none"
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <span className="truncate text-slate-700 dark:text-slate-300">
                                    <span className="font-bold">{a.rank}</span> {a.name} ({a.trade})
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                    {statusLabel}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openEditDisposal(a, statusInfo.dutyCode, statusInfo.dutyName, statusInfo.notes);
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors cursor-pointer flex items-center space-x-1"
                                    title="Click to edit, change or remove disposal for this airman"
                                  >
                                    <span>✏️ Change</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {selectedDisposalAirmenIds.length === 0 ? (
                    'Select personnel above'
                  ) : (
                    <span className="text-purple-600 dark:text-purple-400">
                      {selectedDisposalAirmenIds.length} personnel selected
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDisposalModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disposalLoading || selectedDisposalAirmenIds.length === 0}
                    className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {disposalLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>
                      {selectedDisposalAirmenIds.length > 1
                        ? `Add Disposal (${selectedDisposalAirmenIds.length})`
                        : selectedDisposalAirmenIds.length === 1
                        ? 'Add Disposal (1 Airman)'
                        : 'Select Airmen'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Change Disposal Modal */}
      {editDisposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>✏️ Edit / Change Disposal</span>
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {editDisposalModal.airman.rank} {editDisposalModal.airman.name} • BD/{editDisposalModal.airman.bdNo} • {editDisposalModal.airman.trade} ({editDisposalModal.airman.flightName} Flt)
                </p>
              </div>
              <button
                onClick={() => setEditDisposalModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Current Status Info */}
              <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold block">Current Assignment:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {editDisposalModal.currentDutyName || editDisposalModal.currentDutyCode}
                    {editDisposalModal.notes && <span className="text-slate-500 dark:text-slate-400 ml-1">({editDisposalModal.notes})</span>}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteEditDisposal}
                  disabled={editDisposalLoading}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                >
                  Clear Disposal (Set On Parade)
                </button>
              </div>

              {/* Date Range for Edit */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    From Date:
                  </label>
                  <input
                    type="date"
                    value={editDisposalFromDate}
                    onChange={(e) => setEditDisposalFromDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    To Date:
                  </label>
                  <input
                    type="date"
                    value={editDisposalToDate}
                    min={editDisposalFromDate}
                    onChange={(e) => setEditDisposalToDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Change Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Change Disposal Category To:
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                  {[
                    { code: 'ON_PARADE', label: '✅ On Parade (Clear)' },
                    { code: 'ESSN', label: 'ESSN (Essential)' },
                    { code: 'CMH', label: 'CMH / Hospital' },
                    { code: 'SICK_REPORT', label: 'Sick Report / ED' },
                    { code: 'DRILL_CAT_C', label: "Drill Cat 'C'" },
                    { code: 'LEAVE', label: 'Leave' },
                    { code: 'BAKE_N_BITE', label: 'Bake & Bite' },
                    { code: 'RECEPTION', label: 'Reception / K/O' },
                    { code: 'TDY', label: 'ATT / TDY / DETT' },
                    { code: 'ADMIN_ORDER', label: 'Admin Order' },
                    { code: 'CLASS_TRG', label: 'Class / Trg Ctrl' },
                    { code: 'AIRFIELD_DUTY', label: 'Airfield Duty' },
                    { code: 'GAMES', label: 'G/H & Games' },
                    { code: 'ABSENT', label: 'Absent / AWL' },
                    { code: 'OTHERS', label: '✨ Other Custom' },
                  ].map((cat) => {
                    const isSelected = editDisposalCategory === cat.code;
                    return (
                      <button
                        key={cat.code}
                        type="button"
                        onClick={() => setEditDisposalCategory(cat.code)}
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
                {editDisposalCategory === 'OTHERS' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Specify Custom Disposal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Escort, VVIP Detail, Flood Cell..."
                      value={editDisposalCustomTitle}
                      onChange={(e) => setEditDisposalCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-xs"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditDisposalModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditDisposal}
                disabled={editDisposalLoading}
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {editDisposalLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
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
          documentType={isPtDocument ? 'PT' : 'PARADE'}
          onClose={() => setIsInternalPrintOpen(false)}
        />
      )}
    </div>
  );
};
