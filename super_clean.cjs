const fs = require('fs');

function cleanFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Remove all bg-x, dark:bg-x, print:bg-x from <tr, <th, <td
    let regex = /(<(tr|th|td)[^>]*className="[^"]*)(")/g;
    
    content = content.replace(regex, (match, p1, p2, p3) => {
        let classStr = p1;
        
        // replace any word starting with bg-, dark:bg-, print:bg-
        classStr = classStr.replace(/\bbg-\w+(-\d+)?(\/\d+)?\b/g, '');
        classStr = classStr.replace(/\bdark:bg-\w+(-\d+)?(\/\d+)?\b/g, '');
        classStr = classStr.replace(/\bprint:bg-\w+(-\d+)?(\/\d+)?\b/g, '');
        
        // clean up extra spaces
        classStr = classStr.replace(/\s+/g, ' ').trimEnd();
        
        // Also ensure table has no-zebra
        return classStr + p3;
    });
    
    // Ensure all <table have no-zebra class
    content = content.replace(/<table className="/g, '<table className="no-zebra ');

    fs.writeFileSync(filename, content);
}

const files = [
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/PrintableNightCountModal.tsx',
    'src/components/PrintableFlyingWingModal.tsx',
    'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(cleanFile);
console.log("Super cleaned fills");
