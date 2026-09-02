const fs = require('fs');

function addProp(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  if (!code.includes('userFlight?: string;')) {
    code = code.replace(/role\?: UserRole;/, "role?: UserRole;\n  userFlight?: string;");
    code = code.replace(/role = 'ADMIN',/, "role = 'ADMIN',\n  userFlight,");
  }
  
  if (!code.includes('selectedDate < todayStr')) {
     code = code.replace(/selectedDate/g, "date"); // ah, the prop is 'date' in these modals
  }
  
  // Actually, wait, the selectedDate prop might be named `date` instead of `selectedDate`. Let me fix the replace:
  code = code.replace(/selectedDate < todayStr/g, "(date || new Date().toISOString().split('T')[0]) < todayStr");

  fs.writeFileSync(filename, code);
}

addProp('src/components/PrintableParadeStateModal.tsx');
addProp('src/components/PrintableNightCountModal.tsx');
