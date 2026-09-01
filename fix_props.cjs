const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const targetProps = `interface PrintableParadeStateModalProps {
  role?: UserRole;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  airmen: Airman[];
  initialDocumentType?: 'PARADE' | 'PT';
  onOpenPrintModal?: () => void;
  onViewAirmanProfile?: (airman: Airman) => void;
  onOpenImportModal?: () => void;
}

export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  role = 'ADMIN',
  selectedDate,
  setSelectedDate,
  airmen,
  initialDocumentType = 'PARADE',
  onOpenPrintModal,
  onViewAirmanProfile,
}) => {`;

const newProps = `interface PrintableParadeStateModalProps {
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
`;

code = code.replace(targetProps, newProps);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
