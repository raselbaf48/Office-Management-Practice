const fs = require('fs');

let content = fs.readFileSync('public/manifest.json', 'utf8');
content = content.replace(/"purpose": "any maskable"/g, '"purpose": "any"');
// Let's change background_color to white or transparent? background_color in manifest is for splash screen. 
// theme_color is #0f172a which is dark blue.

fs.writeFileSync('public/manifest.json', content);
console.log("Updated manifest");
