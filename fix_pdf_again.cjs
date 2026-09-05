const fs = require('fs');

let file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

// The issue might be memory/token limits with Mammoth or pdf-parse crashing internally, returning empty string
// We should check the error log. Wait, I can see Mammoth in the code block.

// Wait, the client is sending payload files. Let's trace back from the client.
