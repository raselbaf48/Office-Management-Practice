const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// The main login password Done button
content = content.replace(
  /<div className="mt-2 text-right">\n                    <button type="button" onClick=\{\(\) => setIsPasswordFocused\(false\)\} className="text-xs text-emerald-400 font-bold p-2 hover:bg-emerald-900\/30 rounded-lg">Done<\/button>\n                  <\/div>/g,
  ""
);

// If there are any other 'Done' buttons, replace them too
content = content.replace(
  /<div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsPasswordFocused\(false\)\} className="text-xs text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  ""
);

content = content.replace(
  /<div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsConfirmFocused\(false\)\} className="text-xs text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  ""
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
