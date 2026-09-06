const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableNominalRollModal.tsx', 'utf8');

content = content.replace(/<th className="p-1\.5 border border-black font-bold text-center">Address<\/th>\s*<th className="p-1\.5 border border-black font-bold text-center">Contact<\/th>\s*<th className="p-1\.5 border border-black font-bold text-center">Status<\/th>/g, '');

content = content.replace(/<td className="p-1\.5 border border-black text-left">\s*\{airman\.addressBlock \|\| '-'\.toString\(\)\}\s*<\/td>/g, '');
// Wait, the string is || '-' without .toString(). Let me just use regex carefully.

content = content.replace(/<td className="p-1\.5 border border-black text-left">\s*\{airman\.addressBlock \|\| '-'\}\s*<\/td>\s*<td className="p-1\.5 border border-black text-center">\s*\{airman\.mobileNo \|\| '-'\}\s*<\/td>\s*<td className="p-1\.5 border border-black text-center font-bold">\s*\{airman\.active === false \? 'P\/A' : 'Active'\}\s*<\/td>/g, '');

fs.writeFileSync('src/components/PrintableNominalRollModal.tsx', content);

let docxContent = fs.readFileSync('src/utils/docxExport.ts', 'utf8');
docxContent = docxContent.replace(/createArialHeaderCell\('Address', 1600\),\s*createArialHeaderCell\('Contact', 1500\),\s*createArialHeaderCell\('Status', 1200\),/g, '');
docxContent = docxContent.replace(/createArialCell\(airman\.addressBlock \|\| '-'\),\s*createArialCell\(airman\.mobileNo \|\| '-'\),\s*createArialCell\(airman\.active === false \? 'P\/A' : 'Active'\),/g, '');
fs.writeFileSync('src/utils/docxExport.ts', docxContent);
