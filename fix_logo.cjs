const fs = require('fs');
let file = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// The logo might be getting squished or hidden by the parent div classes
const targetStr = `<div className="w-16 h-20 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-center p-2 shadow-lg">
            <Logo155UASU className="h-16 w-16" />
          </div>`;
          
const replaceStr = `<div className="flex items-center justify-center p-2">
            <Logo155UASU size="lg" />
          </div>`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, replaceStr);
    fs.writeFileSync('src/components/UserLoginGate.tsx', file);
    console.log("Fixed Logo container in UserLoginGate");
} else {
    // Maybe try a more generic replace
    file = file.replace(/<div className="[^"]*bg-emerald-950\/50[^"]*">([\s\S]*?<Logo155UASU[^>]*>[\s\S]*?)<\/div>/, `<div className="flex items-center justify-center p-2 mb-2">\n            <Logo155UASU size="lg" />\n          </div>`);
    fs.writeFileSync('src/components/UserLoginGate.tsx', file);
    console.log("Applied generic fix to UserLoginGate");
}
