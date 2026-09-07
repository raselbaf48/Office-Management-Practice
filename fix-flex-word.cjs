const fs = require('fs');
let content = fs.readFileSync('src/utils/htmlExport.ts', 'utf8');

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

  // Convert Flexbox rows into HTML Tables for MS Word layout support
  const flexRows = clone.querySelectorAll('.flex');
  flexRows.forEach(flex => {
    // Only convert horizontal flex rows that have multiple children
    // Specifically looking for the bottom disposal container and the onPt chunks container
    if ((flex.classList.contains('justify-between') && flex.classList.contains('items-start')) || 
        (flex.classList.contains('space-x-6'))) {
      
      const children = Array.from(flex.children);
      if (children.length > 1) {
        const table = document.createElement('table');
        table.setAttribute('border', '0');
        table.setAttribute('cellpadding', '0');
        table.setAttribute('cellspacing', '0');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.border = 'none';
        
        const tbody = document.createElement('tbody');
        const tr = document.createElement('tr');
        tr.setAttribute('valign', 'top');
        
        children.forEach((child, index) => {
          const td = document.createElement('td');
          td.style.verticalAlign = 'top';
          td.style.border = 'none';
          td.style.padding = '0 12px 0 0'; // simulate gap
          if (index === children.length - 1) td.style.padding = '0';
          
          td.appendChild(child.cloneNode(true));
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
        table.appendChild(tbody);
        flex.parentNode?.replaceChild(table, flex);
      }
    }
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
`;

content = content.replace(/\/\/ Convert OL and UL to div[\s\S]*?\/\/ A comprehensive CSS stylesheet/, addLogic + "\n  // A comprehensive CSS stylesheet");
fs.writeFileSync('src/utils/htmlExport.ts', content);
console.log("Updated htmlExport.ts flexbox handling.");
