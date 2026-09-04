const fs = require('fs');
let file = fs.readFileSync('src/components/NominalRoll.tsx', 'utf8');

// Add state
if (!file.includes('activeContactMenu')) {
  file = file.replace('const [deleting, setDeleting] = useState(false);', `const [deleting, setDeleting] = useState(false);
  const [activeContactMenu, setActiveContactMenu] = useState<string | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveContactMenu(null);
    if (activeContactMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeContactMenu]);`);
  
  // Make sure useEffect is imported
  if (!file.includes('useEffect')) {
    file = file.replace('import React, { useState, useMemo }', 'import React, { useState, useMemo, useEffect }');
  }
}

// Replace Phone TD
const targetTd = `<td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{airman.mobileNo}</span>
                    </div>
                  </td>`;

const replacementTd = `<td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 relative">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer hover:text-emerald-600 transition-colors py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveContactMenu(activeContactMenu === airman.id ? null : airman.id);
                      }}
                    >
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{airman.mobileNo}</span>
                    </div>
                    {activeContactMenu === airman.id && (
                      <div 
                        className="absolute z-10 left-4 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a 
                          href={\`tel:\${airman.mobileNo.replace(/\\D/g, '')}\`}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Normal Call</span>
                        </a>
                        <a 
                          href={\`https://wa.me/88\${airman.mobileNo.replace(/\\D/g, '')}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </td>`;

file = file.replace(targetTd, replacementTd);

fs.writeFileSync('src/components/NominalRoll.tsx', file);
console.log('NominalRoll updated');
