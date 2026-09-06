const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableNominalRollModal.tsx', 'utf8');

content = content.replace(/<th className="p-1\.5 border border-black font-bold text-center">Address<\/th>\s*<th className="p-1\.5 border border-black font-bold text-center">Contact<\/th>\s*<th className="p-1\.5 border border-black font-bold text-center">Status<\/th>/g, '');

content = content.replace(/<td className="p-1\.5 border border-black text-left">\s*\{airman\.addressBlock \|\| '-'\}\s*<\/td>\s*<td className="p-1\.5 border border-black text-center">\s*\{airman\.mobileNo \|\| '-'\}\s*<\/td>\s*<td className="p-1\.5 border border-black text-center font-bold">\s*\{airman\.active === false \? 'P\/A' : 'Active'\}\s*<\/td>/g, '');

fs.writeFileSync('src/components/PrintableNominalRollModal.tsx', content);
