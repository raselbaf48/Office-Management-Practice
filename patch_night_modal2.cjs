const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf8');

const target1 = `interface NightCountStateViewProps {
  role?: UserRole;
  userFlight?: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  airmen: Airman[];
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
}`;

const replacement1 = `interface NightCountStateViewProps {
  role?: UserRole;
  userFlight?: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  initialFromDate?: string;
  initialToDate?: string;
  airmen: Airman[];
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
}`;

code = code.replace(target1, replacement1);

const target2 = `}) => {
  const [activeTab, setActiveTab] = useState<'Night Count' | 'Flying Wing'>('Night Count');`;

code = code.replace(/onViewAirmanProfile,\s*\n}\) => \{/, `onViewAirmanProfile,\n  initialFromDate,\n  initialToDate,\n}) => {`);

const target3 = `  const [fromDate, setFromDate] = useState<string>(selectedDate);
  const [toDate, setToDate] = useState<string>(selectedDate);`;

const replacement3 = `  const [fromDate, setFromDate] = useState<string>(initialFromDate || selectedDate);
  const [toDate, setToDate] = useState<string>(initialToDate || selectedDate);`;

code = code.replace(target3, replacement3);

const target4 = `  useEffect(() => {
    setFromDate(selectedDate);
    setToDate(selectedDate);
    setDisposalFromDate(selectedDate);
    setDisposalToDate(selectedDate);
  }, [selectedDate]);`;

const replacement4 = `  useEffect(() => {
    if (!initialFromDate) setFromDate(selectedDate);
    if (!initialToDate) setToDate(selectedDate);
    setDisposalFromDate(initialFromDate || selectedDate);
    setDisposalToDate(initialToDate || selectedDate);
  }, [selectedDate, initialFromDate, initialToDate]);`;

code = code.replace(target4, replacement4);

fs.writeFileSync('src/components/PrintableNightCountModal.tsx', code);
