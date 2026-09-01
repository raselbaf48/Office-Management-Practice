const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const targetProps = `interface PrintableParadeStateModalProps {
  isOpen?: boolean;
  date: Date;
  onClose: () => void;
  documentType?: 'Parade' | 'PT' | 'PARADE';
  initialFlight?: FlightName | 'Overall';
  flight?: FlightName | 'Overall';
  isMultiDay?: boolean;
  fromDate?: Date;
  toDate?: Date;
  shift?: string;
  airmen?: Airman[];
}

export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  isOpen,
  date,
  onClose,
  documentType = 'Parade',
  initialFlight,
  flight,
  isMultiDay = false,
  fromDate,
  toDate,
  shift,
  airmen = [],
}) => {
  const currentFlight = flight || initialFlight || 'Overall';
  fromDate = fromDate || date || new Date();
  toDate = toDate || date || new Date();
  const onEditCell = undefined;
  const isPtDocument = initialDocumentType === 'PT';
  const [fromDate, setFromDate] = useState<string>(selectedDate);
  const [toDate, setToDate] = useState<string>(selectedDate);`;

const newProps = `interface PrintableParadeStateModalProps {
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
  const [toDate, setToDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));
`;

code = code.replace(targetProps, newProps);

// Also fix `const isMultiDay = datesInRange.length > 1;` later in the file if it conflicts!
code = code.replace('const isMultiDay = datesInRange.length > 1;', 'const isMultiDayComputed = datesInRange.length > 1;');

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Final props update hard complete');
