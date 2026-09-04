const fs = require('fs');

function cleanFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // We want to remove bg-slate-100, bg-slate-200, bg-slate-50, etc. from tr, th, td.
    // Also remove print:bg-slate-something, dark:bg-slate-something if they are used for fill.
    // Let's just do a regex replace for any bg-\w+-\d+, print:bg-\w+-\d+, dark:bg-\w+-\d+ inside <tr, <th, <td
    // Actually, simpler: replace specific known fill classes in these files.
    
    const classesToRemove = [
        'bg-slate-200', 'bg-slate-100', 'bg-slate-50',
        'dark:bg-slate-800', 'dark:bg-slate-900', 'dark:bg-slate-700',
        'print:bg-slate-200', 'print:bg-slate-100', 'print:bg-slate-50',
        'bg-transparent'
    ];
    
    // We only want to remove these from table elements to be safe.
    // Or just globally replace them if they are inside className="..." of tr, td, th.
    
    let regex = /(<(tr|th|td)[^>]*className="[^"]*)(")/g;
    
    content = content.replace(regex, (match, p1, p2, p3) => {
        let classStr = p1;
        classesToRemove.forEach(cls => {
            classStr = classStr.replace(new RegExp('\\b' + cls + '\\b\\s*', 'g'), '');
        });
        return classStr + p3;
    });

    fs.writeFileSync(filename, content);
}

cleanFile('src/components/PrintableParadeStateModal.tsx');
cleanFile('src/components/PrintableNightCountModal.tsx');
cleanFile('src/components/PrintableFlyingWingModal.tsx');
cleanFile('src/components/ParadeStateFormattedView.tsx');

console.log("Cleaned fills");
