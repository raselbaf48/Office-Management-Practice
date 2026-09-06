const http = require('http');

const data = JSON.stringify({
  textSnippet: "BD/474455 Rasel GD 01 Aug"
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/import/analyze-duty-doc',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
