const fs = require('fs');

function addNoZebra(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<table className="/g, '<table className="no-zebra ');
    fs.writeFileSync(file, content);
}

addNoZebra('src/components/PrintableNightCountModal.tsx');
addNoZebra('src/components/PrintableParadeStateModal.tsx');
addNoZebra('src/components/ParadeStateFormattedView.tsx');

let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/tbody tr:nth-child/g, 'table:not(.no-zebra) tbody tr:nth-child');
fs.writeFileSync('src/index.css', css);
console.log("Fixed tables");
