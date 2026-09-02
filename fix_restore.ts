import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// I will just replace from `  useEffect(() => {` to `      {isAddingUser ? (`
// Because that's the part that is completely ruined.

const newLogic = `
  useEffect(() => {
    const handleDetailedUsersChange = (e: any) => {
      setDetailedUsers(e.detail);
    };
    window.addEventListener('baf_detailed_users_changed', handleDetailedUsersChange);
    return () => window.removeEventListener('baf_detailed_users_changed', handleDetailedUsersChange);
  }, []);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ bdNo: '', name: '', rank: '', mobileNo: '', role: 'USER' as UserLoginRole, password: '' });
  
  const isAdmin = userSessionRole === 'ADMIN' || userSessionRole === 'SUPER_ADMIN';
  const isOwner = userSessionRole === 'SUPER_ADMIN';
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editRole, setEditRole] = useState<UserLoginRole>('USER');
  const [editStatus, setEditStatus] = useState<UserLoginStatus>('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [editAdminPass, setEditAdminPass] = useState('');

  const mergedUsers = useMemo(() => {
    const combined = nominalAirmen.map(airman => {
      const dbUser = detailedUsers.find(u => u.cleanBd === airman.cleanBd);
      return {
        ...airman,
        role: dbUser?.role || 'USER',
        status: dbUser?.status || 'ACTIVE',
        password: dbUser?.password || airman.cleanBd,
        adminPass: dbUser?.adminPass || '',
        isDefaultOwner: dbUser?.isDefaultOwner || false,
        lastLogin: dbUser?.lastLogin,
        detailed: dbUser,
        airman
      };
    });
    
    let filtered = combined;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.cleanBd.toLowerCase().includes(q) || 
        u.name.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (flightFilter !== 'ALL') {
      filtered = filtered.filter(u => u.flight === flightFilter);
    }
    return filtered.sort((a, b) => {
      if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') return -1;
      if (a.role !== 'SUPER_ADMIN' && b.role === 'SUPER_ADMIN') return 1;
      return 0;
    });
  }, [nominalAirmen, detailedUsers, searchQuery, roleFilter, flightFilter]);

  const uniqueFlights = useMemo(() => {
    return Array.from(new Set(nominalAirmen.map(a => a.flight))).filter(Boolean).sort();
  }, [nominalAirmen]);

  const openProfile = (user: any) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword(user.password);
    setEditAdminPass(user.adminPass);
    setIsEditingProfile(false);
  };

  const closeProfile = () => {
    setSelectedUser(null);
    setIsEditingProfile(false);
  };

  const handleAddUser = () => {
    if (!newUser.bdNo || !newUser.name || !newUser.password) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const newDetail: DetailedUserLogin = {
      cleanBd: newUser.bdNo,
      role: newUser.role,
      status: 'ACTIVE',
      password: newUser.password,
      adminPass: '',
      isDefaultOwner: false,
      detailedAt: new Date().toISOString(),
      detailedBy: 'System',
    };
    
    const existingIdx = updatedDetailedUsers.findIndex(u => u.cleanBd === newDetail.cleanBd);
    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    
    // Create a mock airman entry for the custom user if they don't exist in nominalAirmen
    // But since this is a local state, it will just show up in the detailed users.
    
    setIsAddingUser(false);
    setNewUser({ bdNo: '', name: '', rank: '', mobileNo: '', role: 'USER', password: '' });
  };

  const saveProfile = () => {
    if (!selectedUser) return;
    
    const updatedDetailedUsers = [...detailedUsers];
    const existingIdx = updatedDetailedUsers.findIndex(u => u.cleanBd === selectedUser.cleanBd);
    
    const newDetail: DetailedUserLogin = {
      cleanBd: selectedUser.cleanBd,
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
      isDefaultOwner: selectedUser.isDefaultOwner,
      detailedAt: new Date().toISOString(),
      detailedBy: 'System',
    };

    if (existingIdx >= 0) {
      updatedDetailedUsers[existingIdx] = newDetail;
    } else {
      updatedDetailedUsers.push(newDetail);
    }
    
    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    closeProfile();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {isAddingUser ? (
            <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : selectedUser ? (
            <button onClick={closeProfile} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isAddingUser ? 'Add Independent User' : selectedUser ? 'User Profile & Access' : 'User Management'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isAddingUser ? 'Create a new standalone user account' : selectedUser ? \`BD/\${selectedUser.cleanBd} - \${selectedUser.airman?.rank || ''} \${selectedUser.airman?.name || selectedUser.name || ''}\` : 'Manage roles, PINs, and access for all nominal airmen'}
            </p>
          </div>
        </div>
        {!isAddingUser && !selectedUser && isOwner && (
          <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm transition-all">
            + Add User
          </button>
        )}
      </div>

      {isAddingUser ? (
`;

const startIndex = code.indexOf('  useEffect(() => {');
const endIndex = code.indexOf('      {isAddingUser ? (');

if (startIndex !== -1 && endIndex !== -1) {
  const toReplace = code.substring(startIndex, endIndex + '      {isAddingUser ? ('.length);
  code = code.replace(toReplace, newLogic);
}

fs.writeFileSync(path, code);
