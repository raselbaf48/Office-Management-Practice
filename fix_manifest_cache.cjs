const fs = require('fs');
let content = fs.readFileSync('public/manifest.json', 'utf8');
content = content.replace(/\/pwa-192x192\.png/g, '/pwa-192x192.png?v=2');
content = content.replace(/\/pwa-512x512\.png/g, '/pwa-512x512.png?v=2');
fs.writeFileSync('public/manifest.json', content);
console.log("Added cache buster to manifest icons");
