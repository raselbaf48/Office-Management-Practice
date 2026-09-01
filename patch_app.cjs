const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('showQuotaBanner')) {
  // Add state
  code = code.replace(
    '  const [darkMode, setDarkMode] = useState<boolean>(true);',
    '  const [darkMode, setDarkMode] = useState<boolean>(true);\n  const [showQuotaBanner, setShowQuotaBanner] = useState<boolean>(() => typeof window !== "undefined" && window.sessionStorage.getItem("firebase_quota_exceeded") === "true");'
  );
  
  // Add effect
  const effectInsert = `
  useEffect(() => {
    const handleQuota = () => setShowQuotaBanner(true);
    window.addEventListener('baf_quota_exceeded', handleQuota);
    return () => window.removeEventListener('baf_quota_exceeded', handleQuota);
  }, []);
`;
  code = code.replace(
    '  useEffect(() => {\n    fetchAirmen();\n  }, []);',
    '  useEffect(() => {\n    fetchAirmen();\n  }, []);\n' + effectInsert
  );
  
  // Add banner UI
  const bannerUi = `
        {showQuotaBanner && (
          <div className="bg-orange-500 text-white px-4 py-2 flex justify-between items-center text-sm font-medium z-50">
            <div>
              <strong className="mr-2">Cloud Sync Disabled:</strong> 
              Daily Firebase free tier write limit (20,000) reached. Your progress will be saved locally in this browser.
            </div>
            <button onClick={() => setShowQuotaBanner(false)} className="opacity-80 hover:opacity-100 ml-4 font-bold">
              Dismiss
            </button>
          </div>
        )}
  `;
  
  code = code.replace(
    '      {/* Layout Grid */}\n      <div className="flex h-screen overflow-hidden">',
    '      {/* Layout Grid */}\n      <div className="flex flex-col h-screen overflow-hidden">\n' + bannerUi + '\n      <div className="flex flex-1 overflow-hidden">'
  );
  
  // We need to fix the closing tag of the new flex-1 div
  code = code.replace(
    '      </div>\n      {/* Modals */}',
    '      </div>\n      </div>\n      {/* Modals */}'
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx');
} else {
  console.log('Already patched');
}
