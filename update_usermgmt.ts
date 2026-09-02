import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace activeAirmen mapping with detailedUsers mapping
code = code.replace(/const activeAirmen = useMemo[^;]+;/, '');

code = code.replace(/const mergedUsers = useMemo\(\(\) => \{[\s\S]*?\}, \[activeAirmen, detailedUsers\]\);/, `
  const mergedUsers = useMemo(() => {
    return detailedUsers.map((detailed, index) => {
      const cleanBd = detailed.bdNo;
      const isDefaultOwner = cleanBd === '53539919' || cleanBd === '48456';
      
      const airman = nominalAirmen.find(a => a.bdNo.trim().replace(/^BD\\/?/i, '').toLowerCase() === cleanBd.toLowerCase()) || {
        id: detailed.airmanId || '',
        serNo: index + 1,
        code: '',
        bdNo: \`BD/\${cleanBd}\`,
        rank: detailed.rank as any,
        name: detailed.name,
        trade: detailed.trade || 'General',
        flightName: detailed.flightName as any,
        remarks: detailed.remarks || '',
        active: detailed.status === 'ACTIVE',
        mobileNo: detailed.mobileNo || '',
      } as Airman;

      return {
        serNo: index + 1,
        cleanBd,
        airman,
        detailed,
        role: isDefaultOwner ? 'SUPER_ADMIN' : detailed.role,
        status: detailed.status,
        password: detailed.password || '',
        adminPass: detailed.adminPass || '',
        ownerPass: detailed.ownerPass || '',
        mobileNo: airman.mobileNo || detailed.mobileNo || '',
        isDefaultOwner
      };
    });
  }, [detailedUsers, nominalAirmen]);
`);

// Add User state and logic
const addModeCode = `
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    bdNo: '', rank: 'AC', name: '', mobileNo: '', trade: 'General', flightName: 'Admin', role: 'USER' as UserLoginRole, password: ''
  });

  const handleAddUser = () => {
    if (!newUser.bdNo.trim() || !newUser.name.trim() || !newUser.password.trim()) {
      alert("User ID, Name, and Password are required.");
      return;
    }
    const cleanBd = newUser.bdNo.replace(/^BD\\/?/i, '').trim();
    if (detailedUsers.some(d => d.bdNo.toLowerCase() === cleanBd.toLowerCase())) {
      alert("This User ID already exists in User Management.");
      return;
    }

    const newDetail: DetailedUserLogin = {
      id: \`user-login-\${cleanBd}-\${Date.now()}\`,
      bdNo: cleanBd,
      rank: newUser.rank,
      name: newUser.name,
      mobileNo: newUser.mobileNo,
      trade: newUser.trade,
      flightName: newUser.flightName,
      role: newUser.role,
      status: 'ACTIVE',
      password: newUser.password,
      adminPass: newUser.role !== 'USER' ? newUser.password : '',
      detailedAt: new Date().toISOString(),
      detailedBy: 'System Admin',
    };

    const updated = [...detailedUsers, newDetail];
    saveDetailedUsers(updated);
    setDetailedUsers(updated);
    setIsAddingUser(false);
    setNewUser({ bdNo: '', rank: 'AC', name: '', mobileNo: '', trade: 'General', flightName: 'Admin', role: 'USER', password: '' });
  };
`;

code = code.replace(/const \[selectedUser, setSelectedUser\] = useState<typeof mergedUsers\[0\] \| null>\(null\);/, addModeCode + '\n  const [selectedUser, setSelectedUser] = useState<typeof mergedUsers[0] | null>(null);');

// Edit logic (when a user updates password, etc, we must also update mobile No or Name since they might be separate now. Wait, they can just edit in Nominal roll for existing users. Manually added users can be edited via same form, but maybe we just stick to password for now).

// Find the table header and add User Pass and Admin Pass for isOwner
code = code.replace(/<th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status<\/th>/, `<th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>\n                  {isOwner && (\n                    <>\n                      <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">User Pass</th>\n                      <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">Admin Pass</th>\n                    </>\n                  )}`);

// Find the table row and add the cells
code = code.replace(/<td className="px-4 py-3 text-center">([\s\S]*?)<\/td>/, `<td className="px-4 py-3">\n                        $1\n                      </td>\n                      {isOwner && (\n                        <>\n                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{user.password}</td>\n                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{user.adminPass || '-'}</td>\n                        </>\n                      )}`);


fs.writeFileSync(path, code);
