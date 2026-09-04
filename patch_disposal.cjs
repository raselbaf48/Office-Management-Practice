const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/DutyRosterPeriodView.tsx', 'src/components/NightCountStateView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/PrintableNightCountModal.tsx'];

for (const file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');

  // Change Add Disposal button colors to rose-600
  // ParadeStateFormattedView / DutyRosterPeriodView / NightCountStateView etc.
  content = content.replace(/bg-pink-600 hover:bg-pink-500 text-white/g, "bg-rose-600 hover:bg-rose-500 text-white");
  content = content.replace(/bg-emerald-600 hover:bg-emerald-700 text-white[^>]*title="Add or update personnel disposal"/g, 'bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer" title="Add or update personnel disposal"');

  // Add the Apply button to the form
  if(content.includes('onClick={() => setShowAddDisposalModal(false)}')) {
    content = content.replace(
      /<\/button>(\s*)<\/div>\s*<\/div>\s*<\/form>/,
      `</button>\n              <button\n                type="submit"\n                disabled={selectedDisposalAirmenIds.length === 0 || addDisposalLoading || (disposalCategory === 'OTHERS' && !disposalCustomTitle.trim())}\n                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-rose-900/20 cursor-pointer"\n              >\n                {addDisposalLoading ? 'Applying...' : 'Apply Disposal'}\n              </button>\n$1</div>\n          </div>\n        </form>`
    );
  }
  
  // Also add it for Edit Disposal Modal if missing
  if(content.includes('onClick={() => setEditDisposalModal(null)}')) {
    content = content.replace(
      /<\/button>(\s*)<\/div>\s*<\/form>/,
      `</button>\n              <button\n                type="submit"\n                disabled={editDisposalLoading || (editDisposalCategory === 'OTHERS' && !editDisposalCustomTitle.trim())}\n                className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-rose-900/20 cursor-pointer"\n              >\n                {editDisposalLoading ? 'Saving...' : 'Save Changes'}\n              </button>\n$1</div>\n        </form>`
    );
  }

  // Update handleAddDisposalSubmit to save custom category
  if (content.includes('const handleAddDisposalSubmit = async (e: React.FormEvent) => {') && content.includes('setDisposalCategory')) {
    content = content.replace(
      /const handleAddDisposalSubmit = async \(e: React\.FormEvent\) => \{\n\s*e\.preventDefault\(\);\n\s*if \(selectedDisposalAirmenIds\.length === 0\) return;\n\s*setAddDisposalLoading\(true\);/,
      `const handleAddDisposalSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (selectedDisposalAirmenIds.length === 0) return;\n    setAddDisposalLoading(true);\n\n    if (disposalCategory === 'OTHERS' && disposalCustomTitle.trim()) {\n      const newCat = { code: 'OTHERS', label: disposalCustomTitle.trim(), customTitle: disposalCustomTitle.trim() };\n      const exists = savedDisposals.some(d => d.label === newCat.label);\n      if (!exists) {\n        const updated = [...savedDisposals, newCat];\n        setSavedDisposals(updated);\n        localStorage.setItem('savedDisposalKeys_Parade', JSON.stringify(updated));\n      }\n    }`
    );
  }
  
  fs.writeFileSync(file, content);
}
console.log("Patched disposal buttons and apply");
