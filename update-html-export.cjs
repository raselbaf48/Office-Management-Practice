const fs = require('fs');
let content = fs.readFileSync('src/utils/htmlExport.ts', 'utf8');

// 1. Change to landscape
content = content.replace('@page { size: A4 portrait; margin: 8mm 12mm; }', '@page { size: A4 landscape; mso-page-orientation: landscape; margin: 8mm 12mm; }');

// 2. Fix the OL/LI issue to prevent double numbering
// Add this logic right before building the HTML string
const addLogic = `
  // Convert OL and UL to div to prevent double numbering in MS Word
  const lists = clone.querySelectorAll('ol, ul');
  lists.forEach(list => {
    const div = document.createElement('div');
    div.className = list.className;
    div.style.cssText = list.style.cssText;
    div.style.margin = '0';
    div.style.padding = '0';
    div.innerHTML = list.innerHTML;
    list.parentNode?.replaceChild(div, list);
  });

  // Since we replaced the parent, we need to query 'li' again on the clone
  const items = clone.querySelectorAll('li');
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = item.className;
    div.style.cssText = item.style.cssText;
    div.style.margin = '0';
    div.style.padding = '2px 0'; // slight spacing for lines
    div.innerHTML = item.innerHTML;
    item.parentNode?.replaceChild(div, item);
  });
  
  // Remove elements that are meant to be hidden in print
  const hiddenElements = clone.querySelectorAll('.print\\\\:hidden, .hidden');
  hiddenElements.forEach(el => {
    el.parentNode?.removeChild(el);
  });

  // A comprehensive CSS stylesheet`;

content = content.replace('// A comprehensive CSS stylesheet', addLogic);

fs.writeFileSync('src/utils/htmlExport.ts', content);
console.log("Updated htmlExport.ts successfully");
