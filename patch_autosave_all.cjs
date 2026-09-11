const fs = require('fs');

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Change function signature if not already changed
  if (!content.includes('overrideCat?: string')) {
    content = content.replace(
      /const handleSaveEditDisposal = async \(\) => \{/g,
      'const handleSaveEditDisposal = async (overrideCat?: string) => {\n  const activeCategory = overrideCat || editDisposalCategory;'
    );
    
    content = content.replace(/if \(editDisposalCategory === 'ON_PARADE'\)/g, "if (activeCategory === 'ON_PARADE')");
    content = content.replace(/const isCustom = editDisposalCategory === 'OTHERS';/g, "const isCustom = activeCategory === 'OTHERS';");
    content = content.replace(/const effectiveDutyCode = isCustom \? 'OTHERS' : editDisposalCategory;/g, "const effectiveDutyCode = isCustom ? 'OTHERS' : activeCategory;");
  }

  // Update onClick handlers for the standard categories
  content = content.replace(
    /onClick=\{\(\) => setEditDisposalCategory\(cat\.code\)\}/g,
    `onClick={() => {
                          setEditDisposalCategory(cat.code);
                          if (cat.code !== 'OTHERS') {
                            handleSaveEditDisposal(cat.code);
                          }
                        }}`
  );
  
  fs.writeFileSync(file, content);
  console.log(`Patched auto-save all in ${file}`);
}

patchFile('src/components/ParadeStateFormattedView.tsx');
patchFile('src/components/NightCountStateView.tsx');

patchFile('src/components/PrintableNightCountModal.tsx');
