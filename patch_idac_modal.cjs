const fs = require('fs');
let code = fs.readFileSync('src/components/IdacDutyAssignModal.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { getFlightDutyQuotaForDate, getIdacShiftsForDateAndFlight } from '../data/officialDutyRatioMatrix';",
  "import { getFlightDutyQuotaForDate, getIdacShiftsForDateAndFlight, getFlightsForIdacShift } from '../data/officialDutyRatioMatrix';"
);

// State changes
code = code.replace(
  "const [selectedFlight, setSelectedFlight] = useState<FlightName>('Avionics');",
  "const [selectedFlight, setSelectedFlight] = useState<FlightName | ''>('');"
);
code = code.replace(
  "const [shift, setShift] = useState<IDAShift>('Night');",
  "const [shift, setShift] = useState<IDAShift | ''>('');"
);

// Replace useEffect for shifts
code = code.replace(
  "const availableShifts = React.useMemo(() => {\n    return getIdacShiftsForDateAndFlight(date, selectedFlight);\n  }, [date, selectedFlight]);\n\n  const [shift, setShift] = useState<IDAShift | ''>('');\n  const [selectedAirmanId, setSelectedAirmanId] = useState<string>('');\n  const [notes, setNotes] = useState<string>('IDA Center Standby / Surveillance Monitor');\n  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);\n  const [isAutoScheduling, setIsAutoScheduling] = useState<boolean>(false);\n  const [autoScheduleDays, setAutoScheduleDays] = useState<number>(7);\n  const [statusMessage, setStatusMessage] = useState<string>('');\n\n  React.useEffect(() => {\n    if (availableShifts.length > 0 && !availableShifts.includes(shift)) {\n      setShift(availableShifts[0]);\n    }\n  }, [availableShifts, shift]);",
  `const [selectedAirmanId, setSelectedAirmanId] = useState<string>('');
  const [notes, setNotes] = useState<string>('IDA Center Standby / Surveillance Monitor');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState<boolean>(false);
  const [autoScheduleDays, setAutoScheduleDays] = useState<number>(7);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const availableFlights = React.useMemo(() => {
    if (!shift) return [];
    return getFlightsForIdacShift(date, shift);
  }, [date, shift]);

  React.useEffect(() => {
    if (shift && availableFlights.length > 0) {
      if (!selectedFlight || !availableFlights.includes(selectedFlight as any)) {
        setSelectedFlight(availableFlights[0]);
      }
    } else if (!shift) {
      setSelectedFlight('');
    }
  }, [shift, availableFlights, selectedFlight]);`
);

// Manual form handling
code = code.replace(
  "if (!selectedAirmanId) {",
  "if (!shift) {\n      alert('Please select a shift');\n      return;\n    }\n    if (!selectedFlight) {\n      alert('Please select a flight');\n      return;\n    }\n    if (!selectedAirmanId) {"
);
code = code.replace(
  "idaShift: shift,",
  "idaShift: shift as IDAShift,"
);

// UI Dropdown fixes
// The shift dropdown:
code = code.replace(
  "<select\n                  value={shift}\n                  onChange={(e) => setShift(e.target.value as IDAShift)}\n                  className=\"w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 cursor-pointer\"\n                >\n                  {(availableShifts.length > 0 ? availableShifts : (['Morning', 'Afternoon', 'Night'] as IDAShift[])).map((s) => {",
  `<select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as IDAShift)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="" disabled>Select Shift</option>
                  {(['Morning', 'Afternoon', 'Night'] as IDAShift[]).map((s) => {`
);

// The flight buttons:
code = code.replace(
  "{(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => (\n                  <button",
  "{shift ? (availableFlights.length > 0 ? availableFlights : (['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[])).map((flt) => (\n                  <button"
);
code = code.replace(
  "onClick={() => setSelectedFlight(flt)}",
  "onClick={() => setSelectedFlight(flt)}\n                    disabled={availableFlights.length > 0 && !availableFlights.includes(flt)}"
);

code = code.replace(
  "Flight (Duty Ratio Allocation)\n              </label>\n              <div className=\"grid grid-cols-4 gap-1.5\">",
  "Flight (Duty Ratio Allocation)\n              </label>\n              <div className=\"grid grid-cols-4 gap-1.5\">\n                {!shift && <div className=\"col-span-4 text-xs text-slate-500\">Please select a shift first</div>}"
);


fs.writeFileSync('src/components/IdacDutyAssignModal.tsx', code);
