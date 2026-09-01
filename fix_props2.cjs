const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// I replaced `isOpen` and `onClose` at the top with `fix_props.cjs` earlier but I might have messed up the component declaration. Let me check the declaration of `PrintableParadeStateModal`.
const target = `export const PrintableParadeStateModal: React.FC<PrintableParadeStateModalProps> = ({
  isOpen,
  date,
  onClose,
  documentType = 'Parade',
  initialFlight,
  flight,
  isMultiDay = false,
  fromDate = new Date(),
  toDate = new Date(),
  shift,
  airmen,
}) => {`;
if (code.includes(target)) {
    console.log("Props are properly declared.");
} else {
    console.log("Props declaration not found!");
}
