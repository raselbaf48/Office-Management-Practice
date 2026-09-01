const fs = require('fs');
let lines = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8').split('\n');

// Find the line with interface PrintableParadeStateModalProps
const startIdx = lines.findIndex(l => l.includes('interface PrintableParadeStateModalProps {'));
// Find the line with const [selectedFlight, setSelectedFlight]
const endIdx = lines.findIndex(l => l.includes("const [selectedFlight, setSelectedFlight] = useState<FlightName | 'Overall'>('Overall');"));

if (startIdx !== -1 && endIdx !== -1) {
    const newLines = `interface PrintableParadeStateModalProps {
  isOpen?: boolean;
  date?: Date;
  onClose?: () => void;
  documentType?: 'Parade' | 'PT' | 'PARADE';
  initialFlight?: FlightName | 'Overall';
  flight?: FlightName | 'Overall';
  shift?: string;
  airmen?: Airman[];
  role?: UserRole;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
  isMultiDay?: boolean;
}

export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  isOpen,
  date,
  onClose = () => {},
  documentType = 'Parade',
  initialFlight,
  flight,
  shift,
  airmen = [],
  role = 'ADMIN',
  selectedDate = new Date().toISOString().split('T')[0],
  setSelectedDate = () => {},
  initialDocumentType = 'PARADE',
  onOpenPrintModal = () => {},
  onViewAirmanProfile,
  onOpenImportModal = () => {},
  isMultiDay = false,
}) => {
  const currentFlight = flight || initialFlight || 'Overall';
  const onEditCell = undefined;
  const isPtDocument = initialDocumentType === 'PT' || documentType === 'PT';
  const [fromDate, setFromDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));
  const [toDate, setToDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));`.split('\n');

    lines.splice(startIdx, endIdx - startIdx, ...newLines);
    
    // Also rename isMultiDay locally
    const fileContent = lines.join('\n').replace(/const isMultiDay = datesInRange.length > 1;/g, 'const isMultiDayComputed = datesInRange.length > 1;');
    
    fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', fileContent);
    console.log('Force replaced with lines');
} else {
    console.log('Could not find start or end index', startIdx, endIdx);
}
