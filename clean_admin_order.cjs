const fs = require('fs');

function cleanFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Remove the second declaration of adminOrderList
  content = content.replace(/const adminOrderList: \{ airman: Airman; note\?: string \}\[\] = \[\];\s*const classTrgList/g, 'const classTrgList');

  // Fix up the render block condition
  content = content.replace(
    /\{\(adminOrderList\.length > 0 \|\| classTrgList\.length > 0 \|\| adminOrderList\.length > 0 \|\| gamesList\.length > 0 \|\| absentList\.length > 0 \|\| Object\.keys\(customDisposalsMap\)\.length > 0\) && \(/g,
    '{(adminOrderList.length > 0 || classTrgList.length > 0 || gamesList.length > 0 || absentList.length > 0 || Object.keys(customDisposalsMap).length > 0) && ('
  );

  // Remove duplicate render blocks
  const block = `{adminOrderList.length > 0 && (
                        <div className="mb-2">
                          <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Admin Order</h3>
                          {renderDisposalAirmenList(adminOrderList, 'ADMIN_ORDER', 'Admin Order')}
                        </div>
                      )}`;
  
  // We can just use a regex to find all duplicate adminOrderList render blocks and replace them with just one.
  const regex = /\{adminOrderList\.length > 0 && \([\s\S]*?renderDisposalAirmenList\(adminOrderList, 'ADMIN_ORDER', 'Admin Order'\)[\s\S]*?\}\)/g;
  
  let matchCount = 0;
  content = content.replace(regex, (match) => {
    matchCount++;
    if (matchCount === 1) return match; // keep the first one
    return ''; // remove subsequent ones
  });

  // Fix up the return object that has Drill Cat-C -> adminOrder
  content = content.replace(/drillCatC: adminOrderList\.map\(\(i\) => i\.airman\),\s*adminOrder: adminOrderList\.map\(\(i\) => i\.airman\),/g, 'adminOrder: adminOrderList.map((i) => i.airman),');

  fs.writeFileSync(file, content, 'utf-8');
}

cleanFile('src/components/ParadeStateFormattedView.tsx');
cleanFile('src/components/NightCountStateView.tsx');
cleanFile('src/components/PrintableParadeStateModal.tsx');
cleanFile('src/components/PrintableNightCountModal.tsx');

console.log("Cleaned adminOrderList duplicates");
