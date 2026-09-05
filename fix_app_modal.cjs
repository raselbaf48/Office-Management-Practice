const fs = require('fs');

function fixApp() {
  let file = 'src/App.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /const \[selectedAirmanProfile, setSelectedAirmanProfile\] = useState<Airman \| null>\(null\);/,
    `const [selectedAirmanProfile, setSelectedAirmanProfile] = useState<{
    airman: Airman;
    initialTab?: 'profile' | 'history';
    initialCategory?: string;
    historyOnly?: boolean;
  } | null>(null);`
  );

  code = code.replace(
    /onViewAirmanProfile=\{\(a\) => setSelectedAirmanProfile\(a\)\}/g,
    `onViewAirmanProfile={(a, config) => setSelectedAirmanProfile({ airman: a, ...config })}`
  );

  code = code.replace(
    /onViewProfile=\{\(a\) => setSelectedAirmanProfile\(a\)\}/g,
    `onViewProfile={(a, config) => setSelectedAirmanProfile({ airman: a, ...config })}`
  );

  code = code.replace(
    /\{selectedAirmanProfile && \(\s*<AirmanProfileModal\s*airman=\{selectedAirmanProfile\}\s*onClose=\{\(\) => setSelectedAirmanProfile\(null\)\}\s*onEditAirman=\{\(a\) => \{\s*setAirmanToEdit\(a\);\s*setIsAddEditOpen\(true\);\s*\}\}\s*role=\{role\}\s*\/>\s*\)\}/,
    `{selectedAirmanProfile && (
        <AirmanProfileModal
          airman={selectedAirmanProfile.airman}
          initialTab={selectedAirmanProfile.initialTab}
          initialCategory={selectedAirmanProfile.initialCategory}
          historyOnly={selectedAirmanProfile.historyOnly}
          onClose={() => setSelectedAirmanProfile(null)}
          onEditAirman={(a) => {
            setAirmanToEdit(a);
            setIsAddEditOpen(true);
          }}
          role={role}
        />
      )}`
  );

  fs.writeFileSync(file, code);
}
fixApp();
console.log('Fixed App.tsx modal state');
