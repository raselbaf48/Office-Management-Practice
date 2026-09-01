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
  role?: UserRole;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
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
  role = 'ADMIN',
  selectedDate,
  setSelectedDate,
  initialDocumentType = 'PARADE',
  onOpenPrintModal,
  onViewAirmanProfile,
  onOpenImportModal
}) => {
  fromDate = fromDate || date || new Date();
  toDate = toDate || date || new Date();
  initialFlight = initialFlight || flight || 'Overall';
  const onEditCell = undefined;`;

const newProps = `interface PrintableParadeStateModalProps {
  isOpen?: boolean;
  date?: Date;
  onClose: () => void;
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
}

export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  isOpen,
  date,
  onClose,
  documentType = 'Parade',
  initialFlight,
  flight,
  shift,
  airmen = [],
  role = 'ADMIN',
  selectedDate,
  setSelectedDate,
  initialDocumentType = 'PARADE',
  onOpenPrintModal,
  onViewAirmanProfile,
  onOpenImportModal
}) => {
  const currentFlight = flight || initialFlight || 'Overall';
  const onEditCell = undefined;
`;

code = code.replace(targetProps, newProps);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
