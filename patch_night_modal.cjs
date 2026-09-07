const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf8');

const target1 = `  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  onClose?: () => void;`;

const replacement1 = `  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  initialFromDate?: string;
  initialToDate?: string;
  onClose?: () => void;`;

code = code.replace(target1, replacement1);

const target2 = `  selectedDate = new Date().toISOString().split('T')[0],
  setSelectedDate = () => {},
  onClose = () => {},
}) => {`;

const replacement2 = `  selectedDate = new Date().toISOString().split('T')[0],
  setSelectedDate = () => {},
  initialFromDate,
  initialToDate,
  onClose = () => {},
}) => {`;

code = code.replace(target2, replacement2);

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
