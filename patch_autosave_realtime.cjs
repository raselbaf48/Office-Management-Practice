const fs = require('fs');

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Change function signature
  content = content.replace(
    /const handleSaveEditDisposal = async \(\) => \{/g,
    'const handleSaveEditDisposal = async (overrideCat?: string) => {\n  const activeCategory = overrideCat || editDisposalCategory;'
  );
  
  // Replace references to editDisposalCategory inside the function
  // We'll replace it carefully in the try block
  content = content.replace(/if \(editDisposalCategory === 'ON_PARADE'\)/g, "if (activeCategory === 'ON_PARADE')");
  content = content.replace(/const isCustom = editDisposalCategory === 'OTHERS';/g, "const isCustom = activeCategory === 'OTHERS';");
  content = content.replace(/const effectiveDutyCode = isCustom \? 'OTHERS' : editDisposalCategory;/g, "const effectiveDutyCode = isCustom ? 'OTHERS' : activeCategory;");

  // Update the onClick handler for the categories
  content = content.replace(
    /onClick=\{\(\) => \{\s*setEditDisposalCategory\(cat\.code\);\s*if \(cat\.code !== 'OTHERS'\) \{\s*setTimeout\(handleSaveEditDisposal, 100\);\s*\}\s*\}\}/g,
    `onClick={() => {
                          setEditDisposalCategory(cat.code);
                          if (cat.code !== 'OTHERS') {
                            handleSaveEditDisposal(cat.code);
                          }
                        }}`
  );
  
  fs.writeFileSync(file, content);
  console.log(`Patched auto-save in ${file}`);
}

patchFile('src/components/PrintableParadeStateModal.tsx');
patchFile('src/components/ParadeStateFormattedView.tsx');
patchFile('src/components/NightCountStateView.tsx');

