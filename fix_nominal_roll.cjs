const fs = require('fs');
const file = 'src/components/NominalRoll.tsx';

let code = fs.readFileSync(file, 'utf8');

// 1. Add to interface
code = code.replace(
  "onSyncGoogleSheet?: () => Promise<void>;",
  "onSyncGoogleSheet?: () => Promise<void>;\n  initialFlightFilter?: FlightName | 'All' | '';"
);

// 2. Add to component signature
code = code.replace(
  "export const NominalRoll: React.FC<NominalRollProps> = ({",
  "export const NominalRoll: React.FC<NominalRollProps> = ({\n  initialFlightFilter = 'All',"
);

// 3. Update useState
code = code.replace(
  "const [flightFilter, setFlightFilter] = useState<FlightName | 'All' | ''>('All');",
  "const [flightFilter, setFlightFilter] = useState<FlightName | 'All' | ''>(initialFlightFilter);"
);

// 4. Update useEffect to listen for changes in initialFlightFilter
const useEffectToAdd = `
  useEffect(() => {
    if (initialFlightFilter) {
      setFlightFilter(initialFlightFilter);
    }
  }, [initialFlightFilter]);
`;
// I will insert it after setSortDirection
code = code.replace(
  "const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');",
  "const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');\n" + useEffectToAdd
);

fs.writeFileSync(file, code);
