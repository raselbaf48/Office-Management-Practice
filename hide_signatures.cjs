const fs = require('fs');

const file = 'src/components/NightCountStateView.tsx';
let content = fs.readFileSync(file, 'utf-8');

// For Multi-day block
content = content.replace(
  /\/\* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY \*\/\s*<div\s*className="flex justify-between items-end pt-1 text-black text-xs min-w-\[700px\] print:min-w-0"/,
  "/* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY */\n            {activeTab !== '155 UASU BAF' && (\n            <div\n              className=\"flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0\""
);
content = content.replace(
  /                  <div className="text-\[10px\] font-normal">\{authorizedBy\.unit \|\| '155 UASU BAF'\}<\/div>\n                <\/div>\n              <\/div>\n            <\/div>\n          <\/div>\n        \) : \(/,
  "                  <div className=\"text-[10px] font-normal\">{authorizedBy.unit || '155 UASU BAF'}</div>\n                </div>\n              </div>\n            </div>\n            )}\n          </div>\n        ) : ("
);

// For Single-day block
content = content.replace(
  /\/\* OFFICIAL SIGNATURE FOOTER \*\/\s*<div\s*className="flex justify-between items-end pt-1 text-black text-xs min-w-\[700px\] print:min-w-0"/,
  "/* OFFICIAL SIGNATURE FOOTER */\n            {activeTab !== '155 UASU BAF' && (\n            <div\n              className=\"flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0\""
);
content = content.replace(
  /                  <div className="text-\[10px\] font-normal">\{authorizedBy\.unit \|\| '155 UASU BAF'\}<\/div>\n                <\/div>\n              <\/div>\n            <\/div>\n          <\/div>\n        \)\}/,
  "                  <div className=\"text-[10px] font-normal\">{authorizedBy.unit || '155 UASU BAF'}</div>\n                </div>\n              </div>\n            </div>\n            )}\n          </div>\n        )}"
);

fs.writeFileSync(file, content, 'utf-8');
console.log("Hidden signatures for 155 UASU BAF tab in NightCountStateView");
