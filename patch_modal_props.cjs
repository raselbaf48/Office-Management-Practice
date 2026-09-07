const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target1 = `  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  initialDocumentType?: 'PARADE' | 'PT';`;

const replacement1 = `  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  initialDocumentType?: 'PARADE' | 'PT';
  initialFromDate?: string;
  initialToDate?: string;`;

code = code.replace(target1, replacement1);

const target2 = `  selectedDate = new Date().toISOString().split('T')[0],
  setSelectedDate = (date: string) => {},
  initialDocumentType = 'PARADE',
  onOpenPrintModal = () => {},
  onViewAirmanProfile,
  onOpenImportModal = () => {},
}) => {`;

const replacement2 = `  selectedDate = new Date().toISOString().split('T')[0],
  setSelectedDate = (date: string) => {},
  initialDocumentType = 'PARADE',
  initialFromDate,
  initialToDate,
  onOpenPrintModal = () => {},
  onViewAirmanProfile,
  onOpenImportModal = () => {},
}) => {`;

code = code.replace(target2, replacement2);

const target3 = `  const [fromDate, setFromDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));
  const [toDate, setToDate] = useState<string>(selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));`;

const replacement3 = `  const [fromDate, setFromDate] = useState<string>(initialFromDate || selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));
  const [toDate, setToDate] = useState<string>(initialToDate || selectedDate || (date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
