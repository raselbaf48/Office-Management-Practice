const fs = require('fs');
const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<style>
  table { border-collapse: collapse; width: 100%; font-family: Arial; font-size: 11pt; }
  th, td { border: 1px solid black; padding: 4px; }
  th { background-color: #f1f5f9; font-weight: bold; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
</style>
</head>
<body>
  <table>
    <tr><th>Header 1</th><th>Header 2</th></tr>
    <tr><td class="text-center font-bold">Center</td><td>Right</td></tr>
  </table>
</body>
</html>
`;
fs.writeFileSync('test.doc', html);
