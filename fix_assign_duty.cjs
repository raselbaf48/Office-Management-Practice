const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

if (!code.includes('getCurrentUserSession')) {
  code = code.replace(/import \{.*?\} from '\.\.\/types';/, `$&
import { getCurrentUserSession } from '../utils/authSession';`);
}

code = code.replace(/const isSuperAdmin =.*?;\n/s, '');
code = code.replace(/export const AssignDutyModal: React\.FC<AssignDutyModalProps> = \(.*?\) => \{/s, 
`$&
  const session = getCurrentUserSession();
  const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';
  const isAdmin = session?.assignedRole === 'ADMIN';
  const adminFlight = session?.flightName;
`);

// 1. Restrict flight selection
// Currently there's a `<select value={selectedFlight}`
// Let's find it.
