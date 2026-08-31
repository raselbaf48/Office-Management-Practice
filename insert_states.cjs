const fs = require('fs');
let code = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

const stateToInsert = `
  // Signature States
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const initialPrep = getSavedPreparedBy();
  const initialAuth = getSavedAuthorizedBy();
  const [leftSig, setLeftSig] = useState<SignatureDetails>(initialPrep);
  const [rightSig, setRightSig] = useState<SignatureDetails>(initialAuth);
  const [leftSigName, setLeftSigName] = useState(initialPrep.name || 'MD NAHID HASAN KHAN');
  const [leftSigRank, setLeftSigRank] = useState(initialPrep.rank || 'SGT');
  const [leftSigDesig, setLeftSigDesig] = useState(initialPrep.designation || 'UWO');
  const [rightSigName, setRightSigName] = useState(initialAuth.name || 'MAHIM RAAD SADAT');
  const [rightSigRank, setRightSigRank] = useState(initialAuth.rank || 'FLT LT');
  const [rightSigDesig, setRightSigDesig] = useState(initialAuth.designation || 'OIC');

  // Add Disposal States
  const [showAddDisposalModal, setShowAddDisposalModal] = useState(false);
  const [disposalDateMode, setDisposalDateMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [disposalFlight, setDisposalFlight] = useState<'Avionics' | 'Airframe' | 'Engine' | 'Electrical' | 'Instrument' | 'Radio'>('Avionics');
  const [disposalCategory, setDisposalCategory] = useState('ESSN');
  const [disposalCustomTitle, setDisposalCustomTitle] = useState('');
  const [disposalScope, setDisposalScope] = useState<'PARADE'|'PT'>('PARADE');
  const [disposalFromDate, setDisposalFromDate] = useState(selectedDate);
  const [disposalToDate, setDisposalToDate] = useState(selectedDate);
  const [selectedDisposalAirmenIds, setSelectedDisposalAirmenIds] = useState<string[]>([]);
  const [disposalSearchQuery, setDisposalSearchQuery] = useState('');
  const [disposalLoading, setDisposalLoading] = useState(false);
  const [disposalSuccessMsg, setDisposalSuccessMsg] = useState('');

  // Sync dates
  useEffect(() => {
    setDisposalFromDate(selectedDate);
    setDisposalToDate(selectedDate);
  }, [selectedDate]);

  const handleAddDisposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisposalAirmenIds.length === 0 || !disposalFromDate || !disposalToDate) return;
    setDisposalLoading(true);
    setDisposalSuccessMsg('');
    try {
      const isCustom = disposalCategory === 'OTHERS';
      const effectiveDutyCode = isCustom ? 'OTHERS' : disposalCategory;
      const effectiveNotes = isCustom ? (disposalCustomTitle.trim() || 'Custom Disposal') : undefined;
      const promises = selectedDisposalAirmenIds.map((airmanId) =>
        fetch('/api/roster/assign-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airmanId,
            dutyCode: effectiveDutyCode,
            fromDate: disposalFromDate,
            toDate: disposalToDate,
            disposalScope: disposalScope,
            notes: effectiveNotes,
          }),
        }).then((r) => r.json().catch(() => ({})))
      );
      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        setDisposalSuccessMsg(\`✅ Disposal assigned to \${successCount} personnel successfully!\`);
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        await fetchRoster();
        setTimeout(() => {
          setShowAddDisposalModal(false);
          setDisposalSuccessMsg('');
          setSelectedDisposalAirmenIds([]);
        }, 1200);
      } else {
        alert('Failed to assign disposal');
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning disposal');
    } finally {
      setDisposalLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
`;

code = code.replace(
  'const [loading, setLoading] = useState(false);',
  'const [loading, setLoading] = useState(false);\n' + stateToInsert
);

fs.writeFileSync('src/components/NightCountStateView.tsx', code);
