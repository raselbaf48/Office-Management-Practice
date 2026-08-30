const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const hookStr = `
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

  // Direct Click Assignment Action`;

content = content.replace('  // Direct Click Assignment Action', hookStr);

fs.writeFileSync(file, content);
