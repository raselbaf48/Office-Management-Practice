const fs = require('fs');
let content = fs.readFileSync('metadata.json', 'utf8');
let json = JSON.parse(content);
json.requestFramePermissions = ["publickey-credentials-create", "publickey-credentials-get"];
fs.writeFileSync('metadata.json', JSON.stringify(json, null, 2));
