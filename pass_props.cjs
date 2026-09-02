const fs = require('fs');

function passProp(filename, tag) {
  let code = fs.readFileSync(filename, 'utf8');
  const regex = new RegExp("<" + tag + "([^>]*?)>", "g");
  code = code.replace(regex, (match, p1) => {
    if (!p1.includes('userFlight={')) {
      // In App.tsx userFlight is userSession?.flightName
      if (filename.includes('App.tsx')) {
         return `<${tag} userFlight={userSession?.flightName} ${p1}>`;
      }
      return `<${tag} userFlight={userFlight} ${p1}>`;
    }
    return match;
  });
  fs.writeFileSync(filename, code);
}

passProp('src/components/ParadeStateFormattedView.tsx', 'PrintableParadeStateModal');
passProp('src/components/NightCountStateView.tsx', 'PrintableNightCountModal');
passProp('src/App.tsx', 'PrintableParadeStateModal');

