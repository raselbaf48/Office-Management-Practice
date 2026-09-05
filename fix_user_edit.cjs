const fs = require('fs');

const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to add state for editing name, rank, flightName, mobileNo
const statePattern = "const [editAdminPass, setEditAdminPass] = useState('');";
if (content.includes(statePattern) && !content.includes("const [editName, setEditName]")) {
  content = content.replace(statePattern, 
    "const [editAdminPass, setEditAdminPass] = useState('');\n  const [editName, setEditName] = useState('');\n  const [editRank, setEditRank] = useState('');\n  const [editFlight, setEditFlight] = useState('');\n  const [editMobile, setEditMobile] = useState('');");
}

fs.writeFileSync(file, content);
console.log("States added");
