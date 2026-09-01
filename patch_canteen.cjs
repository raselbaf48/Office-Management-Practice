const fs = require('fs');
const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Add canteenList = [] next to bakeBiteList
    content = content.replace("const bakeBiteList:", "const canteenList: { airman: Airman; note?: string }[] = [];\n      const bakeBiteList:");
    
    // Populate canteenList
    content = content.replace("} else if (dutyCode === 'BAKE_N_BITE') {", "} else if (dutyCode === 'CANTEEN') {\n          canteenList.push({ airman, note: 'Canteen' });\n        } else if (dutyCode === 'BAKE_N_BITE') {");
    
    // Render Canteen section next to Bake & Bite
    // In ParadeStateFormattedView
    content = content.replace(
      /{bakeBiteList\.length > 0 && \([\s\S]*?Bake & Bite<\/h3>[\s\S]*?renderDisposalAirmenList\(bakeBiteList, 'BAKE_N_BITE', 'Bake & Bite'\)[\s\S]*?<\/div>[\s\S]*?\)}/g,
      match => {
        return `{canteenList.length > 0 && (
          <div>
            <h3 className="font-bold underline text-slate-900 mb-1 capitalize tracking-wide">Canteen</h3>
            {renderDisposalAirmenList(canteenList, 'CANTEEN', 'Canteen')}
          </div>
        )}\n        ${match}`;
      }
    );
    
    // Print modal has `text-black` instead of `text-slate-900`
    content = content.replace(
      /{bakeBiteList\.length > 0 && \([\s\S]*?Bake & Bite<\/h3>[\s\S]*?renderDisposalAirmenList\(bakeBiteList, 'BAKE_N_BITE', 'Bake & Bite'\)[\s\S]*?<\/div>[\s\S]*?\)}/g,
      match => {
        if (!match.includes('text-slate-900')) {
          return `{canteenList.length > 0 && (
            <div>
              <h3 className="font-bold underline text-black mb-1 capitalize tracking-wide">Canteen</h3>
              {renderDisposalAirmenList(canteenList, 'CANTEEN', 'Canteen')}
            </div>
          )}\n          ${match}`;
        }
        return match;
      }
    );
    
    // Add Canteen to disposal assignments mapping
    content = content.replace("if (statusCategory === 'BAKE_N_BITE') {", "if (statusCategory === 'CANTEEN') {\n                      return { isOnParade: false, label: 'Canteen', dutyCode: 'CANTEEN', notes, dutyName: 'Canteen' };\n                    }\n                    if (statusCategory === 'BAKE_N_BITE') {");
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Patched Canteen in ${file}`);
  }
});
