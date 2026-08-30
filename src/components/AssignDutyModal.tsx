import { DateNavigator } from './DateNavigator';
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Search,
  RefreshCw,
  Calendar,
  Sliders,
  Eye,
  EyeOff,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Clock,
  Coffee,
  Building,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Airman,
  DutyCategoryCode,
  FlightName,
  IDAShift,
  DutyAssignment
} from '../types';
import { DUTY_TYPES, DUTY_TYPE_MAP } from '../data/dutyTypes';
import { getStoredDutyRatiosForDate } from '../data/dutyRatios';
import { getIdacShiftsForDateAndFlight, getFlightDutyQuotaForDate } from '../data/officialDutyRatioMatrix';
import { FlightDutyRatioModal } from './FlightDutyRatioModal';

interface AssignDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  setSelectedDate?: (date: string) => void;
  onRefreshParadeData?: () => void;
  airmen: Airman[];
  initialFlight?: FlightName | 'All';
  initialDutyCode?: DutyCategoryCode;
  onlyIdac?: boolean;
  onSuccess?: () => void;
}

export const AssignDutyModal: React.FC<AssignDutyModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  setSelectedDate,
  onRefreshParadeData,
  airmen,
  initialFlight = 'All',
  initialDutyCode,
  onlyIdac = false,
  onSuccess,
}) => {
  // Date Mode: Single Date vs Multi-Date Range
  const [dateMode, setDateMode] = useState<'single' | 'multi'>('single');
  const [fromDate, setFromDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);

  // Active duty & flight filters
  const [activeDutyCode, setActiveDutyCode] = useState<DutyCategoryCode>(
    onlyIdac ? 'IDAC' : (initialDutyCode || 'GD')
  );
  const [activeFlight, setActiveFlight] = useState<FlightName | 'All'>(initialFlight);
  const [activeIdaShift, setActiveIdaShift] = useState<IDAShift>('Morning');
  const [activeLeaveType, setActiveLeaveType] = useState<'Casual' | 'Annual' | 'Recreation'>('Casual');
  const [isProxyEnabled, setIsProxyEnabled] = useState<boolean>(false);
  const [proxyForFlight, setProxyForFlight] = useState<FlightName | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterByRatio, setFilterByRatio] = useState<boolean>(true);
  const [showRatioModal, setShowRatioModal] = useState<boolean>(false);

  // Live assignments map for fromDate (airmanId -> DutyAssignment[])
  const [assignmentsList, setAssignmentsList] = useState<DutyAssignment[]>([]);
  // Previous day assignments to detect Night Off (IDAC Night or GD Night)
  const [prevDayAssignmentsList, setPrevDayAssignmentsList] = useState<DutyAssignment[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [processingAirmanId, setProcessingAirmanId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Update dates & duty code when isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setFromDate(selectedDate);
        setToDate(selectedDate);
      }
      if (onlyIdac) {
        setActiveDutyCode('IDAC');
      } else if (initialDutyCode) {
        setActiveDutyCode(initialDutyCode);
      }
    }
  }, [isOpen, selectedDate, onlyIdac, initialDutyCode]);

  // Dynamically compute available IDAC shifts based on ratio matrix for fromDate and activeFlight
  const availableIdaShifts = useMemo(() => {
    return getIdacShiftsForDateAndFlight(fromDate, activeFlight !== 'All' ? activeFlight : undefined);
  }, [fromDate, activeFlight]);

  // Ensure activeIdaShift is in availableIdaShifts
  useEffect(() => {
    if (availableIdaShifts.length > 0 && !availableIdaShifts.includes(activeIdaShift)) {
      setActiveIdaShift(availableIdaShifts[0]);
    }
  }, [availableIdaShifts, activeIdaShift]);

  // Map of airman ID to Airman object for fast lookup
  const airmanMap = useMemo(() => {
    const map = new Map<string, Airman>();
    airmen.forEach((a) => map.set(a.id, a));
    return map;
  }, [airmen]);

  // Fetch current server roster data for fromDate and previous day (for Night-Off tracking)
  const fetchCurrentRoster = async () => {
    if (!isOpen || !fromDate) return;
    setLoadingInitial(true);
    try {
      const monthKey = fromDate.slice(0, 7);
      
      // Calculate previous day date string
      const currentDateObj = new Date(fromDate);
      const prevDateObj = new Date(currentDateObj);
      prevDateObj.setDate(currentDateObj.getDate() - 1);
      const prevDateStr = prevDateObj.toISOString().split('T')[0];
      const prevMonthKey = prevDateStr.slice(0, 7);

      const resCurrent = await fetch(`/api/roster?month=${monthKey}`);
      let allAssignments: DutyAssignment[] = [];
      if (resCurrent.ok) {
        const data = await resCurrent.json();
        allAssignments = Array.isArray(data.assignments)
          ? data.assignments
          : Array.isArray(data)
          ? data
          : [];
      }

      let prevMonthAssignments: DutyAssignment[] = allAssignments;
      if (prevMonthKey !== monthKey) {
        const resPrev = await fetch(`/api/roster?month=${prevMonthKey}`);
        if (resPrev.ok) {
          const dataPrev = await resPrev.json();
          prevMonthAssignments = Array.isArray(dataPrev.assignments)
            ? dataPrev.assignments
            : Array.isArray(dataPrev)
            ? dataPrev
            : [];
        }
      }

      const dayAssignments = allAssignments.filter((a) => a.date === fromDate);
      setAssignmentsList(dayAssignments);

      const prevDayAssignments = prevMonthAssignments.filter((a) => a.date === prevDateStr);
      setPrevDayAssignmentsList(prevDayAssignments);

    } catch (err) {
      console.error('Failed to load roster for date:', fromDate, err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentRoster();
    }
  }, [isOpen, fromDate]);

  // Helper to get required ratio count for duty
  const getRequiredCountForDuty = (dutyCode: DutyCategoryCode, shift?: IDAShift): number => {
    const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];
    if (activeFlight === 'All') {
      if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
        if (shift) {
          return flights.reduce((sum, f) => sum + getFlightDutyQuotaForDate(fromDate, f, 'IDAC', shift), 0);
        }
        // Total IDAC across all 3 shifts (Morning 1 + Afternoon 1 + Night 2 = 4 daily total)
        const shifts: IDAShift[] = ['Morning', 'Afternoon', 'Night'];
        return shifts.reduce((sSum, sh) => {
          return sSum + flights.reduce((fSum, f) => fSum + getFlightDutyQuotaForDate(fromDate, f, 'IDAC', sh), 0);
        }, 0);
      }
      return flights.reduce((sum, f) => sum + getFlightDutyQuotaForDate(fromDate, f, dutyCode), 0);
    }

    if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
      if (shift) {
        return getFlightDutyQuotaForDate(fromDate, activeFlight, 'IDAC', shift);
      }
      const shifts: IDAShift[] = ['Morning', 'Afternoon', 'Night'];
      return shifts.reduce((sSum, sh) => sSum + getFlightDutyQuotaForDate(fromDate, activeFlight, 'IDAC', sh), 0);
    }
    return getFlightDutyQuotaForDate(fromDate, activeFlight, dutyCode);
  };

  // Helper to check if an airman is currently assigned to the active duty & shift
  const isAirmanAssignedToActiveDuty = (airmanId: string) => {
    return assignmentsList.some((a) => {
      if (a.airmanId !== airmanId) return false;
      if (activeDutyCode === 'ATT' || activeDutyCode === 'AIRPORT') {
        return a.dutyCode === 'ATT' || a.dutyCode === 'AIRPORT';
      }
      if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
        return (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === activeIdaShift;
      }
      return a.dutyCode === activeDutyCode;
    });
  };

  // Helper to get detailed list of assigned airmen for any duty code (and optional shift)
  const getAssignedAirmenForDuty = (dutyCode: DutyCategoryCode, shift?: IDAShift) => {
    const list: { airman: Airman; assignment: DutyAssignment }[] = [];
    assignmentsList.forEach((assignment) => {
      const airman = airmanMap.get(assignment.airmanId);
      if (!airman) return;
      if (activeFlight !== 'All' && airman.flightName !== activeFlight) return;

      const isMatch =
        (dutyCode === 'ATT' || dutyCode === 'AIRPORT')
          ? assignment.dutyCode === 'ATT' || assignment.dutyCode === 'AIRPORT'
          : (dutyCode === 'IDAC' || dutyCode === 'IDA')
          ? (assignment.dutyCode === 'IDAC' || assignment.dutyCode === 'IDA') && (!shift || assignment.idaShift === shift)
          : assignment.dutyCode === dutyCode;

      if (isMatch) {
        list.push({ airman, assignment });
      }
    });

    // Sort by seniority (serNo)
    return list.sort((a, b) => a.airman.serNo - b.airman.serNo);
  };

  // Helper to count currently assigned airmen for active duty (and shift if IDAC)
  const currentlyAssignedCount = useMemo(() => {
    return getAssignedAirmenForDuty(
      activeDutyCode,
      (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') ? activeIdaShift : undefined
    ).length;
  }, [assignmentsList, activeDutyCode, activeIdaShift, activeFlight, airmanMap]);

  // Required quota for currently selected duty & shift
  const currentRequiredQuota = useMemo(() => {
    if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
      return getRequiredCountForDuty('IDAC', activeIdaShift);
    }
    return getRequiredCountForDuty(activeDutyCode);
  }, [activeDutyCode, activeIdaShift, activeFlight, fromDate]);


  const handleShiftDate = (days: number) => {
    if (!fromDate) return;
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setFromDate(newDate);
    setToDate(newDate);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (dateMode === 'single') {
        if (e.key === 'ArrowRight') {
          handleShiftDate(1);
        } else if (e.key === 'ArrowLeft') {
          handleShiftDate(-1);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dateMode, fromDate]);

  // Direct Click Assignment Action (No Draft System)
  const handleToggleAssignAirman = async (airman: Airman) => {
    const isCurrentlyAssignedToThisDuty = isAirmanAssignedToActiveDuty(airman.id);

    setProcessingAirmanId(airman.id);

    try {
      if (isCurrentlyAssignedToThisDuty) {
        // Unassign airman
        const res = await fetch('/api/roster/delete-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airmanId: airman.id,
            fromDate,
            toDate,
            dutyCode: activeDutyCode,
            idaShift: (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') ? activeIdaShift : undefined,
          }),
        });

        if (res.ok) {
          setAssignmentsList((prev) => {
            return prev.filter((a) => {
              if (a.airmanId !== airman.id) return true;
              if (activeDutyCode === 'ATT' || activeDutyCode === 'AIRPORT') {
                return a.dutyCode !== 'ATT' && a.dutyCode !== 'AIRPORT';
              }
              if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
                return !((a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === activeIdaShift);
              }
              return a.dutyCode !== activeDutyCode;
            });
          });
          setToastMessage(`Removed ${airman.rank} ${airman.name} from duty`);
          setTimeout(() => setToastMessage(''), 2500);
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
          if (onRefreshParadeData) onRefreshParadeData();
        } else {
          alert('Failed to remove assignment');
        }
      } else {
        // Direct Assign Airman
        const notes = activeDutyCode === 'LEAVE' ? `${activeLeaveType} Leave` : '';
        const targetFlight = proxyForFlight && isProxyEnabled ? proxyForFlight : (activeFlight !== 'All' ? activeFlight : airman.flightName);

        // Find if there is any previously assigned airman from this same flight for this duty (and shift if IDAC)
        const previousFlightAssignee = assignmentsList.find((a) => {
          if (a.airmanId === airman.id) return false;
          const assignedAirman = airmen.find((m) => m.id === a.airmanId);
          if (!assignedAirman || assignedAirman.flightName !== targetFlight) return false;
          if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
            return (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === activeIdaShift;
          }
          if (activeDutyCode === 'ATT' || activeDutyCode === 'AIRPORT') {
            return a.dutyCode === 'ATT' || a.dutyCode === 'AIRPORT';
          }
          return a.dutyCode === activeDutyCode;
        });

        // If previously assigned airman exists from this flight, unassign them first to enforce single selection per flight slot
        if (previousFlightAssignee) {
          try {
            await fetch('/api/roster/delete-range', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                airmanId: previousFlightAssignee.airmanId,
                fromDate,
                toDate,
                dutyCode: previousFlightAssignee.dutyCode,
                idaShift: previousFlightAssignee.idaShift,
              }),
            });
          } catch (e) {
            console.error('Error auto-replacing previous assignee:', e);
          }
        }

        const res = await fetch('/api/roster/assign-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airmanId: airman.id,
            dutyCode: activeDutyCode,
            idaShift: activeDutyCode === 'IDAC' || activeDutyCode === 'IDA' ? activeIdaShift : undefined,
            fromDate,
            toDate,
            notes,
            proxyForFlight: isProxyEnabled && proxyForFlight ? proxyForFlight : undefined,
          }),
        });

        if (res.ok) {
          const newAssignment: DutyAssignment = {
            airmanId: airman.id,
            date: fromDate,
            dutyCode: activeDutyCode,
            idaShift: activeDutyCode === 'IDAC' || activeDutyCode === 'IDA' ? activeIdaShift : undefined,
            notes,
            proxyForFlight: isProxyEnabled && proxyForFlight ? proxyForFlight : undefined,
          };
          setAssignmentsList((prev) => {
            let updated = prev;
            if (previousFlightAssignee) {
              updated = updated.filter((a) => !(a.airmanId === previousFlightAssignee.airmanId && a.dutyCode === previousFlightAssignee.dutyCode && a.idaShift === previousFlightAssignee.idaShift));
            }
            if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
              if (activeIdaShift === 'Night') {
                const filtered = updated.filter((a) => !(a.airmanId === airman.id && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift === 'Night'));
                return [...filtered, newAssignment];
              } else {
                const filtered = updated.filter((a) => !(a.airmanId === airman.id && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA') && a.idaShift !== 'Night'));
                return [...filtered, newAssignment];
              }
            } else {
              const filtered = updated.filter((a) => a.airmanId !== airman.id);
              return [...filtered, newAssignment];
            }
          });
          const dtName = DUTY_TYPE_MAP.get(activeDutyCode as any)?.name || activeDutyCode;
          const shiftSuffix = (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') ? ` (${activeIdaShift})` : '';
          setToastMessage(`✅ ${airman.rank} ${airman.name} assigned to ${dtName}${shiftSuffix}`);
          setTimeout(() => setToastMessage(''), 2500);
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
          if (onRefreshParadeData) onRefreshParadeData();
          if (onSuccess) onSuccess();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || 'Failed to assign duty');
        }
      }
    } catch (err: any) {
      console.error('Direct assignment error:', err);
      alert(`Network error: ${err.message}`);
    } finally {
      setProcessingAirmanId(null);
    }
  };

  // Helper to format duty name badge on airman card and determine availability
  const getDutyStatusInfo = (airmanId: string) => {
    const airmanAssignments = assignmentsList.filter((a) => a.airmanId === airmanId);
    const prevAssignments = prevDayAssignmentsList.filter((a) => a.airmanId === airmanId);

    // 1. Current Day Assignment
    if (airmanAssignments.length > 0) {
      // Leave
      const leave = airmanAssignments.find((a) => a.dutyCode === 'LEAVE');
      if (leave) {
        const notesLower = (leave.notes || '').toLowerCase();
        let lbl = 'Leave';
        if (notesLower.includes('casual')) lbl = 'Leave (CL)';
        else if (notesLower.includes('annual')) lbl = 'Leave (AL)';
        else if (notesLower.includes('recreation')) lbl = 'Leave (RL)';
        return { label: lbl, type: 'LEAVE', isFixed: true };
      }
      // TDY
      const tdy = airmanAssignments.find((a) => a.dutyCode === 'TDY');
      if (tdy) return { label: 'TDY', type: 'TDY', isFixed: true };

      // Fixed Task Forces
      const btf = airmanAssignments.find((a) => a.dutyCode === 'BTF');
      if (btf) return { label: 'BTF', type: 'BTF', isFixed: true };

      const ntf = airmanAssignments.find((a) => a.dutyCode === 'NTF');
      if (ntf) return { label: 'NTF', type: 'NTF', isFixed: true };

      const halishahar = airmanAssignments.find((a) => a.dutyCode === 'HALISHAHAR');
      if (halishahar) return { label: 'Halishahar', type: 'HALISHAHAR', isFixed: true };

      // Other operational duties
      const airport = airmanAssignments.find((a) => a.dutyCode === 'AIRPORT' || a.dutyCode === 'ATT');
      if (airport) return { label: 'Airport', type: 'AIRPORT', isFixed: false };

      const gd = airmanAssignments.find((a) => a.dutyCode === 'GD');
      if (gd) return { label: 'Security (GD)', type: 'GD', isFixed: false };

      const bnb = airmanAssignments.find((a) => a.dutyCode === 'BAKE_N_BITE');
      if (bnb) return { label: 'Bake & Bite', type: 'BAKE_N_BITE', isFixed: false };

      // IDAC Duties
      const idacAssignments = airmanAssignments.filter((a) => a.dutyCode === 'IDAC' || a.dutyCode === 'IDA');
      if (idacAssignments.length > 0) {
        const shifts = idacAssignments.map((a) => a.idaShift).filter(Boolean).join(' + ');
        return { label: `IDAC ${shifts || ''}`.trim(), type: 'IDAC', isFixed: false };
      }

      const firstDuty = airmanAssignments[0];
      let name = DUTY_TYPE_MAP.get(firstDuty.dutyCode as any)?.name || firstDuty.dutyCode;

      if (firstDuty.dutyCode === 'DUTY_OFF') {
        if (prevAssignments.length > 0) {
          const yestAss = prevAssignments[0];
          let offShort = 'Duty Off';
          if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
          else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
          else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
          else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
          else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
          else if (yestAss.notes?.toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
          
          name = offShort;
        } else {
          name = firstDuty.previousDutyName || firstDuty.notes || 'Duty Off';
        }
      }

      return { label: name, type: firstDuty.dutyCode, isFixed: false };
    }

    // 2. Check if person performed Heavy/Night Duty yesterday (Night Off today)
    if (prevAssignments.length > 0) {
      const yestAss = prevAssignments[0];
      const isHeavy =
        ['GD', 'BTF', 'NTF', 'AIRPORT'].includes(yestAss.dutyCode) ||
        ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') ||
        (yestAss.notes || '').toLowerCase().includes('idac');
        
      if (isHeavy) {
        let offShort = 'Duty Off';
        if (yestAss.dutyCode === 'GD') offShort = 'GD Off';
        else if (yestAss.dutyCode === 'BTF') offShort = 'BTF Off';
        else if (yestAss.dutyCode === 'NTF') offShort = 'NTF Off';
        else if (yestAss.dutyCode === 'AIRPORT') offShort = 'Airport Off';
        else if ((yestAss.dutyCode === 'IDAC' || yestAss.dutyCode === 'IDA') && yestAss.idaShift === 'Night') offShort = 'IDAC Nt Off';
        else if ((yestAss.notes || '').toLowerCase().includes('idac')) offShort = 'IDAC Nt Off';
        
        return { label: offShort, type: 'NIGHT_OFF', isFixed: false };
      }
    }

    // 3. Otherwise available on parade
    return { label: 'On Parade', type: 'ON_PARADE', isFixed: false };
  };

  // Filter candidates for the active duty and active flight
  const candidatePersonnel = useMemo(() => {
    const targetFlight = proxyForFlight && isProxyEnabled ? proxyForFlight : activeFlight;

    return airmen
      .filter((airman) => {
        if (targetFlight !== 'All' && airman.flightName !== targetFlight) return false;

        const isAssigned = isAirmanAssignedToActiveDuty(airman.id);
        if (isAssigned) return true;

        const rankLower = (airman.rank || '').toLowerCase();
        const isWO = ['wo', 'swo', 'mwo', 'w/o'].some((r) => rankLower.includes(r));

        // IDAC Duty: All ranks eligible (MWO, SWO, WO, Sgt, Cpl, LAC, AC) - no exclusions
        if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
          return true;
        }

        // For soldier duties (non-IDAC), exclude Warrant Officers
        if (['GD', 'AIRPORT', 'ATT', 'BTF', 'NTF', 'HALISHAHAR', 'BAKE_N_BITE'].includes(activeDutyCode)) {
          if (isWO) return false;
        }

        // Security Duty (GD) is strictly for Corporals & LACs/ACs
        if (activeDutyCode === 'GD') {
          const isCplOrBelow = ['cpl', 'lac', 'ac1', 'ac2', 'corporal'].some((r) => rankLower.includes(r));
          if (!isCplOrBelow) return false;
        }

        // Task Force duties (BTF, NTF, HALISHAHAR)
        if (['BTF', 'NTF', 'HALISHAHAR'].includes(activeDutyCode)) {
          const isEligible = ['sgt', 'cpl', 'lac', 'ac1', 'ac2', 'sergeant', 'corporal', 'aircraftman'].some((r) => rankLower.includes(r));
          if (!isEligible) return false;
        }

        return true;
      })
      .filter((airman) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          airman.name.toLowerCase().includes(q) ||
          airman.rank.toLowerCase().includes(q) ||
          airman.bdNo.toLowerCase().includes(q) ||
          airman.trade.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const isAInCurrent = isAirmanAssignedToActiveDuty(a.id);
        const isBInCurrent = isAirmanAssignedToActiveDuty(b.id);

        if (isAInCurrent && !isBInCurrent) return -1;
        if (!isAInCurrent && isBInCurrent) return 1;

        const infoA = getDutyStatusInfo(a.id);
        const infoB = getDutyStatusInfo(b.id);

        // Put On Parade and Night-Off first when unassigned
        const isAAvailable = infoA.type === 'ON_PARADE' || infoA.type === 'NIGHT_OFF';
        const isBAvailable = infoB.type === 'ON_PARADE' || infoB.type === 'NIGHT_OFF';
        if (isAAvailable && !isBAvailable) return -1;
        if (!isAAvailable && isBAvailable) return 1;

        // Priority for Airport in Avionics: Sgt Mustakim
        if (activeDutyCode === 'ATT' || activeDutyCode === 'AIRPORT') {
          const isAMustakim = a.name.toLowerCase().includes('mustakim') || a.bdNo === '469598';
          const isBMustakim = b.name.toLowerCase().includes('mustakim') || b.bdNo === '469598';
          if (isAMustakim && !isBMustakim) return -1;
          if (!isAMustakim && isBMustakim) return 1;
        }

        return a.serNo - b.serNo;
      });
  }, [airmen, activeFlight, proxyForFlight, isProxyEnabled, activeDutyCode, activeIdaShift, searchQuery, assignmentsList, prevDayAssignmentsList]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full p-4 sm:p-5 space-y-3.5 relative overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl text-white shadow-md ${onlyIdac ? 'bg-teal-600' : 'bg-emerald-600'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {onlyIdac ? 'IDA Center Duty Assignment' : 'Direct Duty Assignment'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
                  onlyIdac 
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}>
                  Instant Auto-Save
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {onlyIdac
                  ? 'Click IDAC shift and airman below to assign directly. Synchronized with Dashboard & Matrix.'
                  : 'Click any airman to assign directly. Previous duty is automatically replaced.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Toast Notification */}
        {toastMessage && (
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          
          {/* 1. Date Selection Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Assignment Date:
              </span>
              <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setDateMode('single');
                    setToDate(fromDate);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    dateMode === 'single'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  onClick={() => setDateMode('multi')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    dateMode === 'multi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Multi-Date Range
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {dateMode === 'single' && (
                <button
                  type="button"
                  onClick={() => handleShiftDate(-1)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                  title="Previous Date (Left Arrow Key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <DateNavigator
                hideArrows={true}                
                value={fromDate || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  if (dateMode === 'single' || !toDate || toDate < val) {
                    setToDate(val);
                  }
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              />
              {dateMode === 'single' && (
                <button
                  type="button"
                  onClick={() => handleShiftDate(1)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                  title="Next Date (Right Arrow Key)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {dateMode === 'multi' && (
                <>
                  <span className="text-xs text-slate-400">to</span>
                  <DateNavigator
                    
                    value={toDate || ''}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          {/* 2. Duty Category or IDAC Shift Selection */}
          {!onlyIdac && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    1. Choose Duty
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Click duty, then click airman below to assign)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setFilterByRatio(!filterByRatio)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1 cursor-pointer"
                  >
                    {filterByRatio ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{filterByRatio ? 'Ratio Duties' : 'Show All'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatioModal(true)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1 cursor-pointer"
                    title="Configure Official Ratios"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Ratios</span>
                  </button>
                </div>
              </div>

              {/* Duty Category Cards with Detailed Airmen List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {(() => {
                  const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
                  const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code) > 0);
                  const dutiesToRender = filterByRatio && ratioFiltered.length > 0 ? ratioFiltered : allDuties;

                  return dutiesToRender.map((dt) => {
                    const isSelected = activeDutyCode === dt.code;
                    const reqQuota = getRequiredCountForDuty(dt.code);
                    const assignedList = getAssignedAirmenForDuty(dt.code);

                    return (
                      <div
                        key={dt.code}
                        onClick={() => setActiveDutyCode(dt.code)}
                        className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-start cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-sm ring-2 ring-emerald-500/30'
                            : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 hover:shadow-xs'
                        }`}
                      >
                        {/* Header: Duty Name & Ratio Badge (e.g. 3/3) */}
                        <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-1.5 mb-1.5">
                          <span className={`text-[11px] font-black truncate leading-tight ${isSelected ? 'text-emerald-950 dark:text-emerald-100' : 'text-slate-900 dark:text-slate-100'}`}>
                            {dt.name}
                          </span>
                          <div className="shrink-0">
                            {reqQuota > 0 ? (
                              <span
                                className={`text-[9.5px] font-black px-1.5 py-0.2 rounded-full ${
                                  assignedList.length === reqQuota
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : assignedList.length > reqQuota
                                    ? 'bg-rose-600 text-white'
                                    : assignedList.length > 0
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {assignedList.length}/{reqQuota}
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {assignedList.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Detailed Airmen List */}
                        <div className="space-y-1">
                          {assignedList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic py-0.5">
                              — None
                            </p>
                          ) : (
                            assignedList.map((item, idx) => (
                              <div
                                key={`${item.airman.id}-${item.assignment.dutyCode}-${item.assignment.idaShift || ''}-${idx}`}
                                className="text-[10.5px] leading-tight font-semibold text-slate-800 dark:text-slate-200 truncate bg-slate-50/80 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50"
                                title={`${item.airman.rank} ${item.airman.name}`}
                              >
                                <span className="text-slate-400 dark:text-slate-500 font-bold mr-1">{idx + 1}.</span>
                                {item.airman.rank} {item.airman.name}
                                {(item.assignment.dutyCode === 'IDAC' || item.assignment.dutyCode === 'IDA') && item.assignment.idaShift && (
                                  <span className="ml-1 text-[9.5px] text-teal-600 dark:text-teal-400 font-bold">
                                    ({item.assignment.idaShift[0]})
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* IDAC Dynamic Shift Picker (Shows detailed airmen for each shift) */}
          {(onlyIdac || activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && (
            <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-teal-950 dark:text-teal-100 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{onlyIdac ? '1. Select IDAC Shift Slot:' : 'Select IDAC Shift (Auto-filtered by Duty Ratio):'}</span>
                </label>
                <span className="text-xs text-teal-700 dark:text-teal-300 font-bold">
                  {activeFlight !== 'All' ? `${activeFlight} Flight` : 'All Flights'}
                </span>
              </div>
              {availableIdaShifts.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-center">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    No IDAC shift duty allocated for {activeFlight} Flight on this date.
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    According to the Official Duty Ratio Matrix, quota is 0 for {activeFlight} Flight on {fromDate}.
                  </p>
                </div>
              ) : (
                <div className={`grid gap-2 ${availableIdaShifts.length === 1 ? 'grid-cols-1' : availableIdaShifts.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                  {availableIdaShifts.map((s) => {
                    const shiftQuota = getRequiredCountForDuty('IDAC', s);
                    const shiftAssigned = getAssignedAirmenForDuty('IDAC', s);
                    const isShiftSelected = activeIdaShift === s;

                    return (
                      <div
                        key={s}
                        onClick={() => setActiveIdaShift(s)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-start ${
                          isShiftSelected
                            ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-400/40'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-teal-200 dark:border-teal-900/80 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-xs">
                            {s} Shift
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isShiftSelected ? 'bg-white text-teal-900' : 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
                            }`}
                          >
                            {shiftAssigned.length}{shiftQuota > 0 ? `/${shiftQuota}` : ''}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {shiftAssigned.length === 0 ? (
                            <span className={`text-[10.5px] italic ${isShiftSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                              — None Assigned
                            </span>
                          ) : (
                            shiftAssigned.map((item, idx) => (
                              <div
                                key={`${item.airman.id}-${s}-${idx}`}
                                className={`text-[11px] px-2 py-1 rounded-lg font-bold truncate ${
                                  isShiftSelected ? 'bg-teal-700/90 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                                title={`${item.airman.rank} ${item.airman.name} (${item.airman.flightName})`}
                              >
                                <span className="opacity-70 mr-1.5">{idx + 1}.</span>
                                {item.airman.rank} {item.airman.name}
                                <span className="ml-1 opacity-75 font-normal text-[10px]">
                                  ({item.airman.flightName})
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Flight Filter & Candidate Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            {/* Flight Tabs */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                2. Flight:
              </span>
              {(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setActiveFlight(flt)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeFlight === flt
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            {/* Currently Assigned Status Pill */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Assigned: <strong className="text-emerald-600">{currentlyAssignedCount}</strong>
                {currentRequiredQuota > 0 && (
                  <span> / {currentRequiredQuota} Quota</span>
                )}
              </span>
            </div>
          </div>

          {/* 4. Personnel Candidate List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Airmen List (Click to Assign / Unassign)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {candidatePersonnel.length} Airmen
                </span>
              </div>
            </div>

            {/* Candidate Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, rank, BD no, trade..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Candidate Grid: Clean display showing strictly Rank & Name + Duty Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              {candidatePersonnel.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No matching candidates found for this duty & flight.
                </div>
              ) : (
                candidatePersonnel.map((airman) => {
                  const isCurrentDutyAssigned = isAirmanAssignedToActiveDuty(airman.id);
                  const statusInfo = getDutyStatusInfo(airman.id);

                  // Disabled rules:
                  // User rule: "Sudhu Matro On Parade & Duty Off enable thakbe" + if assigning same active duty, allow unassigning
                  // Exception: For IDAC Night duty, someone who has IDAC Morning / Afternoon is eligible because Morning is regular office hours!
                  // Exception: For IDAC Morning/Afternoon duty, someone who has IDAC Night is eligible!
                  // For all other duties (e.g. Base Security GD, Airport, BTF, NTF, Halishahar, Leave, TDY):
                  // If an airman already has another duty (e.g. Airport) when assigning GD, they must NOT be selectable unless they are On Parade or Duty Off.
                  let isEligible = false;
                  if (isCurrentDutyAssigned) {
                    // Always allow clicking to unassign
                    isEligible = true;
                  } else if (activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') {
                    // User requirement: For IDAC Duty, all personnel in the flight are visible and eligible, even if on other disposal
                    isEligible = true;
                  } else if (statusInfo.type === 'ON_PARADE' || statusInfo.type === 'NIGHT_OFF') {
                    // On Parade or Duty Off are always eligible
                    isEligible = true;
                  }

                  const isDisabled = !isEligible;
                  const isProcessing = processingAirmanId === airman.id;

                  return (
                    <button
                      key={airman.id}
                      type="button"
                      disabled={isDisabled || isProcessing}
                      onClick={() => handleToggleAssignAirman(airman)}
                      title={
                        isDisabled
                          ? `${airman.rank} ${airman.name} is on ${statusInfo.label} and is not eligible for ${DUTY_TYPE_MAP.get(activeDutyCode as any)?.name || activeDutyCode}.`
                          : undefined
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isDisabled
                          ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                          : isCurrentDutyAssigned
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/40 cursor-pointer'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer'
                      }`}
                    >
                      {/* Left: Pure Rank & Name */}
                      <div className="flex items-center space-x-2 truncate mr-2">
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500 shrink-0" />
                        ) : isCurrentDutyAssigned ? (
                          <div className="w-4 h-4 rounded-md bg-white text-emerald-700 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isDisabled ? (
                          <div className="w-4 h-4 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 shrink-0" />
                        )}

                        <span
                          className={`font-bold text-xs truncate ${
                            isCurrentDutyAssigned
                              ? 'text-white font-black'
                              : isDisabled
                              ? 'text-slate-600 dark:text-slate-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {airman.rank} {airman.name}
                        </span>
                      </div>

                      {/* Right: Duty Status Name */}
                      <div className="shrink-0">
                        {isCurrentDutyAssigned ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/20 text-white">
                            ✓ Assigned
                          </span>
                        ) : statusInfo.type === 'LEAVE' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            - {statusInfo.label}
                          </span>
                        ) : statusInfo.type === 'TDY' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            - TDY
                          </span>
                        ) : statusInfo.type === 'BTF' || statusInfo.type === 'NTF' || statusInfo.type === 'HALISHAHAR' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            - {statusInfo.label}
                          </span>
                        ) : statusInfo.type === 'NIGHT_OFF' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            - {statusInfo.label}
                          </span>
                        ) : statusInfo.type !== 'ON_PARADE' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            - {statusInfo.label}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            - On Parade
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-500">
            <span>
              Date: <strong>{fromDate}</strong>
              {dateMode === 'multi' && fromDate !== toDate ? ` to ${toDate}` : ''} • Changes are applied directly.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>

      {/* Flight Duty Ratio Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          isOpen={showRatioModal}
          onClose={() => setShowRatioModal(false)}
          selectedDate={fromDate}
          onRatioUpdated={() => {
            fetchCurrentRoster();
          }}
        />
      )}
    </div>
  );
};
