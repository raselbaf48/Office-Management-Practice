const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Find the Modal Action Buttons in the Edit Disposal modal
    const regex = /\{\/\* Modal Action Buttons \*\/\}\s*<div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800 dark:border-slate-700">/g;

    content = content.replace(regex, `{/* Modal Action Buttons */}
                        {editDisposalCategory === 'OTHERS' && (
                          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800 dark:border-slate-700">`);

    // The closing </div> for the action buttons is right before the </div> for the modal content.
    // So we can replace "<span>Save Changes</span>\n                        </button>\n                      </div>"
    // with "<span>Done</span>\n                        </button>\n                      </div>\n                    )}"
    const replaceRegex = /<span>Save Changes<\/span>\s*<\/button>\s*<\/div>/g;
    content = content.replace(replaceRegex, `<span>Done</span>\n                        </button>\n                      </div>\n                    )}`);

    fs.writeFileSync(file, content);
    console.log(`Patched Done button in ${file}`);
  }
}
