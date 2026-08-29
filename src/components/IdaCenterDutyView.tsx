import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Phone,
  Calendar,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Settings,
  FileDown,
  Printer,
  CalendarRange,
} from 'lucide-react';
import { Airman, UserRole, DutyAssignment, FlightName, IDAShift } from '../types';
import { Logo155UASU } from './Logo155UASU';
import {
  getIdacResponsibilities,
  getIdacEmergencyContacts,
  IdacResponsibility,
  IdacEmergencyContact,
} from '../data/idacSettings';
import { IdacSettingsModal } from './IdacSettingsModal';
import { AssignDutyModal } from './AssignDutyModal';
import { getFlightDutyQuotaForDate } from '../data/officialDutyRatioMatrix';
import { exportIdacRosterDocx, IdacRosterRow } from '../utils/docxExport';

interface IdaCenterDutyViewProps {
  role: UserRole;
  airmen: Airman[];
  selectedDate: string;
  onViewAirmanProfile?: (airman: Airman) => void;
}

interface IdaScheduleItem {
  id: string;
  date: string;
  dateDisplay: string;
  dayDisplay: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  shiftTime: string;
  airman?: Airman;
  fallbackFlight?: FlightName;
  dutyNotes?: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export const IdaCenterDutyView: React.FC<IdaCenterDutyViewProps> = ({
  role,
  airmen,
  selectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'ROSTER'>('LIVE');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [scheduleList, setScheduleList] = useState<IdaScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // IDAC Settings & Assign Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);

  // Responsibilities & Emergency Contacts
  const [responsibilities, setResponsibilities] = useState<IdacResponsibility[]>(getIdacResponsibilities);
  const [emergencyContacts, setEmergencyContacts] = useState<IdacEmergencyContact[]>(getIdacEmergencyContacts);

  const fetchSettings = () => {
    setResponsibilities(getIdacResponsibilities());
    setEmergencyContacts(getIdacEmergencyContacts());
  };

  // IDAC Duty Roster Period Filter States
  const getDutyWeekRange = (refDateStr: string, offsetWeeks: number = 0) => {
    const [y, m, d] = (refDateStr || '2026-08-28').split('-').map(Number);
    const ref = new Date(Date.UTC(y, m - 1, d));
    const day = ref.getUTCDay(); // 0=Sun ... 5=Fri, 6=Sat
    const daysSinceFriday = (day + 2) % 7;

    const start = new Date(ref);
    start.setUTCDate(ref.getUTCDate() - daysSinceFriday + offsetWeeks * 7);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const format = (dObj: Date) => {
      const yy = dObj.getUTCFullYear();
      const mm = String(dObj.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(dObj.getUTCDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    };

    return { from: format(start), to: format(end) };
  };

  const initialWeek = getDutyWeekRange(selectedDate || '2026-08-28', 0);
  const [rosterFromDate, setRosterFromDate] = useState<string>(initialWeek.from);
  const [rosterToDate, setRosterToDate] = useState<string>(initialWeek.to);
  const [weekPreset, setWeekPreset] = useState<'THIS_WEEK' | 'NEXT_WEEK' | 'FULL_MONTH' | 'CUSTOM'>('THIS_WEEK');
  const [rosterAssignments, setRosterAssignments] = useState<DutyAssignment[]>([]);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for settings update
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setResponsibilities(getIdacResponsibilities());
      setEmergencyContacts(getIdacEmergencyContacts());
    };
    window.addEventListener('baf_idac_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('baf_idac_settings_updated', handleSettingsUpdate);
  }, []);

  // Fetch / assemble IDA center live schedule
  const fetchIdaSchedule = async () => {
    setLoading(true);
    try {
      const baseDate = selectedDate ? new Date(selectedDate) : new Date();
      const datesToFetch: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        datesToFetch.push(`${yyyy}-${mm}-${dd}`);
      }

      // Fetch parade states & roster for these dates
      const results = await Promise.all(
        datesToFetch.map((dStr) =>
          fetch(`/api/parade-state?date=${dStr}&shift=Morning&flight=Overall`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );

      const items: IdaScheduleItem[] = [];

      datesToFetch.forEach((dStr, idx) => {
        const pData = results[idx];
        const dObj = new Date(dStr);
        const dateDisplay = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const dayDisplay = dObj.toLocaleDateString('en-US', { weekday: 'short' });

        const pList = pData?.personnelStatusList || [];

        const idaPersonnel = pList.filter((item: any) => {
          const code = (item.dutyCode || '').toUpperCase();
          const notes = (item.notes || '').toLowerCase();
          return code === 'IDAC' || code === 'IDA' || notes.includes('ida') || notes.includes('idac');
        });

        if (idaPersonnel.length > 0) {
          idaPersonnel.forEach((item: any) => {
            const shiftType: 'Morning' | 'Afternoon' | 'Night' =
              item.idaShift === 'Night' || item.notes?.toLowerCase().includes('night')
                ? 'Night'
                : item.idaShift === 'Afternoon' || item.notes?.toLowerCase().includes('aft')
                ? 'Afternoon'
                : 'Morning';

            const timeRange =
              shiftType === 'Night'
                ? '21:00 - 07:30 hrs'
                : shiftType === 'Afternoon'
                ? '14:30 - 21:00 hrs'
                : '07:30 - 14:30 hrs';

            items.push({
              id: `${dStr}-${item.airman.id}-${shiftType}`,
              date: dStr,
              dateDisplay,
              dayDisplay,
              shift: shiftType,
              shiftTime: timeRange,
              airman: item.airman,
              dutyNotes: item.notes || 'IDA Center Operational Duty',
              status: idx === 0 ? 'Active' : 'Upcoming',
            });
          });
        } else {
          // If no specific airman assigned, determine flight ratio slot for this date
          const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
          const shifts: Array<'Morning' | 'Afternoon' | 'Night'> = ['Night', 'Morning', 'Afternoon'];
          
          shifts.forEach((sh) => {
            let slotFlt: FlightName = 'Avionics';
            for (const fl of flights) {
              if (getFlightDutyQuotaForDate(dStr, fl, 'IDAC', sh) > 0) {
                slotFlt = fl;
                break;
              }
            }

            const timeRange =
              sh === 'Night'
                ? '21:00 - 07:30 hrs'
                : sh === 'Afternoon'
                ? '14:30 - 21:00 hrs'
                : '07:30 - 14:30 hrs';

            items.push({
              id: `${dStr}-unassigned-${sh}`,
              date: dStr,
              dateDisplay,
              dayDisplay,
              shift: sh,
              shiftTime: timeRange,
              fallbackFlight: slotFlt,
              dutyNotes: `Scheduled Slot (${slotFlt} Flight Duty Ratio)`,
              status: idx === 0 ? 'Active' : 'Upcoming',
            });
          });
        }
      });

      setScheduleList(items);
    } catch (err) {
      console.error('Failed to load IDA schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full period assignments for IDAC Duty Roster Tab
  const fetchRosterAssignments = async () => {
    try {
      const fromMonth = rosterFromDate.slice(0, 7);
      const toMonth = rosterToDate.slice(0, 7);
      const months = Array.from(new Set([fromMonth, toMonth]));

      const promises = months.map((mKey) =>
        fetch(`/api/roster?month=${mKey}`)
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data.assignments) ? data.assignments : Array.isArray(data) ? data : [];
          })
          .catch(() => [])
      );

      const results = await Promise.all(promises);
      setRosterAssignments(results.flat());
    } catch (err) {
      console.error('Failed to fetch roster assignments:', err);
    }
  };

  useEffect(() => {
    fetchIdaSchedule();
    fetchRosterAssignments();

    const handleUpdated = () => {
      fetchIdaSchedule();
      fetchRosterAssignments();
    };

    window.addEventListener('baf_state_updated', handleUpdated);
    return () => window.removeEventListener('baf_state_updated', handleUpdated);
  }, [selectedDate, rosterFromDate, rosterToDate, airmen]);

  // Determine current active shift based on actual clock hour
  const currentActiveShiftType = useMemo((): 'Morning' | 'Afternoon' | 'Night' => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Morning: 07:30 (450m) to 14:30 (870m)
    // Afternoon: 14:30 (870m) to 21:00 (1260m)
    // Night: 21:00 (1260m) to 07:30 (450m)
    if (totalMinutes >= 450 && totalMinutes < 870) {
      return 'Morning';
    } else if (totalMinutes >= 870 && totalMinutes < 1260) {
      return 'Afternoon';
    } else {
      return 'Night';
    }
  }, []);

  // Currently On Duty Shift Item
  const currentlyOnDutyItem = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const match = scheduleList.find((s) => s.date === today && s.shift === currentActiveShiftType);
    if (match) return match;

    // Fallback if today's item not directly matched
    const anyActive = scheduleList.find((s) => s.shift === currentActiveShiftType);
    return anyActive || scheduleList[0] || null;
  }, [scheduleList, currentActiveShiftType]);

  // Next Active Shift Item
  const nextActiveShift = useMemo(() => {
    return scheduleList.find((s) => s.id !== currentlyOnDutyItem?.id) || scheduleList[0] || null;
  }, [scheduleList, currentlyOnDutyItem]);

  // Clean phone number for WhatsApp link
  const getWhatsAppLink = (airman?: Airman, customPhone?: string): string => {
    const raw = customPhone || airman?.mobileNo || '';
    const clean = raw.replace(/\D/g, '');
    if (!clean) return 'https://wa.me/';
    if (clean.startsWith('880')) return `https://wa.me/${clean}`;
    if (clean.startsWith('01')) return `https://wa.me/88${clean}`;
    return `https://wa.me/880${clean}`;
  };

  // Build IDAC Duty Roster Table Rows
  const getDatesList = (startStr: string, endStr: string): string[] => {
    const list: string[] = [];
    try {
      const [sY, sM, sD] = startStr.split('-').map(Number);
      const [eY, eM, eD] = endStr.split('-').map(Number);
      const curr = new Date(Date.UTC(sY, sM - 1, sD));
      const end = new Date(Date.UTC(eY, eM - 1, eD));
      let limit = 0;
      while (curr <= end && limit < 65) {
        const yy = curr.getUTCFullYear();
        const mm = String(curr.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(curr.getUTCDate()).padStart(2, '0');
        list.push(`${yy}-${mm}-${dd}`);
        curr.setUTCDate(curr.getUTCDate() + 1);
        limit++;
      }
    } catch {}
    return list;
  };

  const activeRosterDates = useMemo(() => getDatesList(rosterFromDate, rosterToDate), [rosterFromDate, rosterToDate]);
  const airmanMap = useMemo(() => new Map<string, Airman>(airmen.map((a) => [a.id, a])), [airmen]);

  const formatShiftDutyDisplay = (
    dateStr: string,
    shift: 'Morning' | 'Afternoon' | 'Night',
    shiftAssignments: DutyAssignment[]
  ): string => {
    const flightOrder: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
    const requiredFlightSlots: FlightName[] = [];
    flightOrder.forEach((fl) => {
      const count = getFlightDutyQuotaForDate(dateStr, fl, 'IDAC', shift);
      for (let i = 0; i < count; i++) {
        requiredFlightSlots.push(fl);
      }
    });

    const getFlightShort = (fl: string) => {
      if (!fl) return '';
      if (fl.toLowerCase().includes('av')) return 'Avi Flt';
      if (fl.toLowerCase().includes('mech')) return 'Mech Flt';
      if (fl.toLowerCase().includes('gcs')) return 'GCS Flt';
      if (fl.toLowerCase().includes('admin') || fl.toLowerCase().includes('admn')) return 'Admn Flt';
      return `${fl} Flt`;
    };

    const assignedParts: string[] = [];
    const fulfilledFlights: FlightName[] = [];

    shiftAssignments.forEach((a) => {
      const air = airmanMap.get(a.airmanId);
      if (!air) {
        assignedParts.push(a.notes || 'Duty Airman');
        return;
      }

      const proxyFlight = a.proxyForFlight;
      const isProxy = proxyFlight && proxyFlight !== air.flightName;

      if (isProxy) {
        assignedParts.push(`${air.rank} ${air.name} (${getFlightShort(proxyFlight)})`);
        fulfilledFlights.push(proxyFlight);
      } else {
        assignedParts.push(`${air.rank} ${air.name}`);
        if (air.flightName) fulfilledFlights.push(air.flightName);
      }
    });

    const remainingFlights = [...requiredFlightSlots];
    for (const ff of fulfilledFlights) {
      const idx = remainingFlights.indexOf(ff);
      if (idx !== -1) {
        remainingFlights.splice(idx, 1);
      } else if (remainingFlights.length > 0) {
        remainingFlights.shift();
      }
    }

    const placeholderParts = remainingFlights.map((rf) => getFlightShort(rf));
    const allParts = [...assignedParts, ...placeholderParts];

    return allParts.length > 0 ? allParts.join(' & ') : '-';
  };

  const idacRosterRows: IdacRosterRow[] = useMemo(() => {
    return activeRosterDates.map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dObj = new Date(Date.UTC(y, m - 1, d));
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dObj.getUTCDay()];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateDisplay = `${d} ${months[dObj.getUTCMonth()]}`;

      const dateAss = rosterAssignments.filter((a) => a.date === dateStr && (a.dutyCode === 'IDAC' || a.dutyCode === 'IDA'));

      const morningAss = dateAss.filter((a) => !a.idaShift || a.idaShift === 'Morning');
      const afternoonAss = dateAss.filter((a) => a.idaShift === 'Afternoon');
      const nightAss = dateAss.filter((a) => a.idaShift === 'Night');

      return {
        dateDisplay,
        dayDisplay: dayName,
        morning: formatShiftDutyDisplay(dateStr, 'Morning', morningAss),
        afternoon: formatShiftDutyDisplay(dateStr, 'Afternoon', afternoonAss),
        night: formatShiftDutyDisplay(dateStr, 'Night', nightAss),
      };
    });
  }, [activeRosterDates, rosterAssignments, airmanMap]);

  const handleExportRosterDocx = async () => {
    setIsExportingDocx(true);
    try {
      const headerDateRange = `${rosterFromDate} to ${rosterToDate}`;
      await exportIdacRosterDocx(
        '155 UASU BAF',
        headerDateRange,
        idacRosterRows,
        `IDAC_Center_Duty_Roster_155_UASU_${rosterFromDate}_to_${rosterToDate}.docx`
      );
    } catch (err) {
      console.error('Error generating docx:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-14 bg-emerald-950/20 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center p-1 border border-emerald-500/20 shadow-xs">
            <Logo155UASU className="w-10 h-12" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                IDA Center Duty
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                155 UASU
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {currentDateFormatted || 'Friday, August 28, 2026'} • 24/7 Automation & Surveillance
            </p>
          </div>
        </div>

        {/* Right Controls: Live Clock & Admin Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Clock Pill */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
              {currentTime || '03:09:40 PM'}
            </span>
          </div>

          {/* Admin Duty Assign & Settings Buttons */}
          {role === 'ADMIN' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAssignOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Assign IDAC Duty or Auto-Schedule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Duty</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center cursor-pointer border border-slate-200 dark:border-slate-700"
                title="IDAC Settings (Responsibilities & Emergency Contacts)"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. TAB SELECTOR (Live Shift Center vs IDAC Duty Roster Format) */}
      <div className="flex items-center space-x-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('LIVE')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'LIVE'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Live Shifts & Center Status
        </button>
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ROSTER'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          IDAC Duty Roster (Official Schedule & Export)
        </button>
      </div>

      {activeTab === 'LIVE' ? (
        <div className="space-y-6 animate-fadeIn">
          {/* 3. CURRENTLY ON DUTY (LIVE ACTIVE SHIFT) */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#072418] via-[#0b3824] to-[#051c13] border border-emerald-800/60 shadow-xl p-6 sm:p-8 text-white">
            <div className="absolute -right-12 -top-12 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CURRENTLY ON DUTY (LIVE)</span>
                </div>
                <span className="text-xs font-bold text-emerald-200/80 bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-700/40">
                  {currentlyOnDutyItem?.shift} Shift ({currentlyOnDutyItem?.shiftTime || 'Active Now'})
                </span>
              </div>

              {currentlyOnDutyItem?.airman ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
                      <span>
                        {currentlyOnDutyItem.airman.rank} {currentlyOnDutyItem.airman.name}
                      </span>
                    </div>
                    <p className="text-emerald-200/90 text-sm font-medium">
                      {currentlyOnDutyItem.airman.flightName} Flight • {currentlyOnDutyItem.airman.trade} • {currentlyOnDutyItem.dutyNotes || 'IDAC Surveillance & Gen Monitor'}
                    </p>
                  </div>

                  {/* Right WhatsApp Link Button */}
                  <div className="flex sm:justify-end shrink-0">
                    <a
                      href={getWhatsAppLink(currentlyOnDutyItem.airman)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                      title="Direct Chat"
                    >
                      <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-black text-amber-300">
                      {currentlyOnDutyItem?.fallbackFlight || 'Avionics'} Flight Slot
                    </div>
                    <p className="text-emerald-200/70 text-xs font-medium">
                      Scheduled based on Flight Duty Ratio. Awaiting specific individual naming.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl">
                    Ratio Allocated Slot
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. NEXT ACTIVE SHIFT HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#170e43] via-[#201062] to-[#120838] border border-indigo-900/60 shadow-xl p-6 sm:p-8 text-white">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>UPCOMING NEXT SHIFT</span>
              </div>

              {nextActiveShift && nextActiveShift.airman ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
                      <span>{nextActiveShift.airman.rank} {nextActiveShift.airman.name}</span>
                    </div>
                    <p className="text-indigo-200/80 text-sm font-medium">
                      {nextActiveShift.airman.flightName} Flight • {nextActiveShift.airman.trade} • {nextActiveShift.dutyNotes || 'IDA Center Standby'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-indigo-300/90">
                      <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{nextActiveShift.dateDisplay} ({nextActiveShift.dayDisplay})</span>
                      </span>
                      <span className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{nextActiveShift.shift} Shift ({nextActiveShift.shiftTime})</span>
                      </span>
                    </div>
                  </div>

                  {/* Right WhatsApp Link Button */}
                  <div className="flex sm:justify-end shrink-0">
                    <a
                      href={getWhatsAppLink(nextActiveShift.airman)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                      title="Direct Chat"
                    >
                      <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-black text-indigo-200">
                      {nextActiveShift?.fallbackFlight || 'Avionics'} Flight Slot
                    </div>
                    <p className="text-indigo-300/70 text-xs font-medium">
                      Scheduled by Duty Ratio: {nextActiveShift?.dateDisplay} ({nextActiveShift?.shift} Shift - {nextActiveShift?.shiftTime})
                    </p>
                  </div>
                  <div className="text-xs font-bold text-indigo-300 bg-indigo-900/60 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
                    Ratio Slot ({nextActiveShift?.fallbackFlight || 'Avionics'})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. UPCOMING SCHEDULE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Upcoming Shifts Schedule
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                NEXT 7 DAYS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3 px-6">DATE</th>
                    <th className="py-3 px-6">SHIFT</th>
                    <th className="py-3 px-6">DUTY PERSONNEL / FLIGHT</th>
                    <th className="py-3 px-6">HOURS</th>
                    <th className="py-3 px-6 text-right">CONTACT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                        Loading upcoming IDAC shifts...
                      </td>
                    </tr>
                  ) : scheduleList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                        No upcoming shifts scheduled.
                      </td>
                    </tr>
                  ) : (
                    scheduleList.slice(0, 10).map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Date */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {item.dateDisplay}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {item.dayDisplay}
                          </div>
                        </td>

                        {/* Shift */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              item.shift === 'Night'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : item.shift === 'Afternoon'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {item.shift}
                          </span>
                        </td>

                        {/* Staff Member / Flight Name (Ratio) */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {item.airman ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {item.airman.rank} {item.airman.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                                {item.airman.flightName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {item.fallbackFlight || 'Avionics'} Flight
                              </span>
                              <span className="text-[10px] text-slate-400">(Duty Ratio Slot)</span>
                            </div>
                          )}
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-6 font-mono font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.shiftTime}
                        </td>

                        {/* WhatsApp Link Action */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          {item.airman ? (
                            <a
                              href={getWhatsAppLink(item.airman)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-2xs cursor-pointer"
                              title="Direct Chat"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. DUTY RESPONSIBILITIES CARD (Dynamic from Settings) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Duty Responsibilities
                </h2>
              </div>
              {role === 'ADMIN' && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs text-slate-400 hover:text-emerald-600 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit List</span>
                </button>
              )}
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1 font-medium">
              {responsibilities.map((r) => (
                <li key={r.id} className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold select-none">•</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. EMERGENCY CONTACTS CARD (Dynamic from Settings with WhatsApp Links) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Emergency Contacts
                </h2>
              </div>
              {role === 'ADMIN' && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs text-slate-400 hover:text-amber-500 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manage Contacts</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
                >
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <span>{c.name}</span>
                      {c.rankDesignation && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({c.rankDesignation})
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.phone}
                    </div>
                  </div>
                  <a
                    href={getWhatsAppLink(undefined, c.whatsappPhone || c.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                    title={`Message ${c.name} on WhatsApp`}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* IDAC DUTY ROSTER MATRIX TAB (Full Official BAF Table & DOCX Export) */
        <div className="space-y-6 animate-fadeIn">
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 text-xs font-black uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Integrated IDAC Duty Matrix • 155 UASU</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                IDAC Center Schedule & Duty Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Displays Morning, Afternoon, and Night shifts with Flight Ratio quotas and Word Export.
              </p>
            </div>

            {/* Presets & Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-1">
                <button
                  onClick={() => {
                    const range = getDutyWeekRange(selectedDate || '2026-08-28', 0);
                    setRosterFromDate(range.from);
                    setRosterToDate(range.to);
                    setWeekPreset('THIS_WEEK');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    weekPreset === 'THIS_WEEK'
                      ? 'bg-teal-600 text-white shadow-xs font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    const range = getDutyWeekRange(selectedDate || '2026-08-28', 1);
                    setRosterFromDate(range.from);
                    setRosterToDate(range.to);
                    setWeekPreset('NEXT_WEEK');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    weekPreset === 'NEXT_WEEK'
                      ? 'bg-teal-600 text-white shadow-xs font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  Next Week
                </button>
              </div>

              {/* Word Export */}
              <button
                onClick={handleExportRosterDocx}
                disabled={isExportingDocx}
                className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExportingDocx ? 'Exporting...' : 'Export Word'}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-black uppercase text-slate-600 dark:text-slate-300">
                    <th className="py-3 px-4 w-28">DATE</th>
                    <th className="py-3 px-4 w-28">DAY</th>
                    <th className="py-3 px-4">MORNING (0730F - 1430F)</th>
                    <th className="py-3 px-4">AFTERNOON (1430F - 2100F)</th>
                    <th className="py-3 px-4">NIGHT (2100F - 0730F)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {idacRosterRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {row.dateDisplay}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                        {row.dayDisplay}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {row.morning}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {row.afternoon}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {row.night}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* IDAC Settings Modal */}
      <IdacSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          fetchSettings();
        }}
        airmen={airmen}
      />

      {/* IDAC Duty Assign Modal (Synchronized with Dashboard Assignment System) */}
      <AssignDutyModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        airmen={airmen}
        selectedDate={selectedDate}
        onlyIdac={true}
        onDutyAssigned={() => {
          fetchIdaSchedule();
          fetchRosterAssignments();
        }}
      />
    </div>
  );
};
