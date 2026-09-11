const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// I'll make the buttons in Edit Disposal auto-save when clicked, except for OTHERS which requires typing.
// Let's modify the category button click handler.

const regex = /onClick=\{\(\) => setEditDisposalCategory\(cat\.code\)\}/g;
content = content.replace(regex, `onClick={() => {
                          setEditDisposalCategory(cat.code);
                          if (cat.code !== 'OTHERS') {
                            setTimeout(handleSaveEditDisposal, 100);
                          }
                        }}`);

fs.writeFileSync(file, content);
console.log("Patched auto-save for Edit Disposal");

