const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

// Replace Drill Cat-C with Admin Order
content = content.replace(/Drill Cat-C/g, 'Admin Order');
content = content.replace(/DRILL_CAT_C/g, 'ADMIN_ORDER');
content = content.replace(/drillCatCList/g, 'adminOrderList');

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content, 'utf-8');
console.log("Fixed Admin Order in ParadeStateFormattedView");

let nightContent = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');
nightContent = nightContent.replace(/Drill Cat-C/g, 'Admin Order');
nightContent = nightContent.replace(/DRILL_CAT_C/g, 'ADMIN_ORDER');
nightContent = nightContent.replace(/drillCatCList/g, 'adminOrderList');
fs.writeFileSync('src/components/NightCountStateView.tsx', nightContent, 'utf-8');
console.log("Fixed Admin Order in NightCountStateView");
