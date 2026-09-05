const fs = require('fs');

function fixNominalRoll() {
  let file = 'src/components/NominalRoll.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Fix flight filter
  code = code.replace(
    /<option value="All">All Flights<\/option>\s*\{flightsList.map\(\(fl\) => \(/,
    `{flightsList.map((fl) => (`
  );

  // Fix rank filter
  code = code.replace(
    /<option value="All">All Ranks<\/option>\s*\{ranksList.map\(\(rk\) => \(/,
    `{ranksList.map((rk) => (`
  );

  fs.writeFileSync(file, code);
}

function fixAirmanProfileModal() {
  let file = 'src/components/AirmanProfileModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Set default tab to 'profile'
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState\<'history' \| 'profile'\>\('history'\);/,
    `const [activeTab, setActiveTab] = useState<'history' | 'profile'>('profile');`
  );

  // Remove Printer button at the top
  code = code.replace(
    /<button\s*onClick=\{\(\) => window\.print\(\)\}[\s\S]*?<Printer className="w-4 h-4" \/>\s*<\/button>/,
    ``
  );

  // Remove X button at the top
  code = code.replace(
    /<button\s*onClick=\{onClose\}\s*className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"\s*>\s*<X className="w-5 h-5" \/>\s*<\/button>/,
    ``
  );

  fs.writeFileSync(file, code);
}

fixNominalRoll();
fixAirmanProfileModal();
console.log('Fixed Nominal Roll and Airman Profile Modal');
