const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace hardcoded "K/O & Reception" headers with dynamic based on isPtDocument
  content = content.replace(
    /<h3 className="font-bold underline text-slate-900 dark:text-white print:text-black mb-1 capitalize tracking-wide">K\/O & Reception<\/h3>/g,
    '<h3 className="font-bold underline text-slate-900 dark:text-white print:text-black mb-1 capitalize tracking-wide">{isPtDocument ? "Reception Duty" : "K/O & Reception"}</h3>'
  );
  
  content = content.replace(
    /<h3 className="font-bold underline text-slate-900 dark:text-white mb-1 capitalize tracking-wide">K\/O & Reception<\/h3>/g,
    '<h3 className="font-bold underline text-slate-900 dark:text-white mb-1 capitalize tracking-wide">{isPtDocument ? "Reception Duty" : "K/O & Reception"}</h3>'
  );

  content = content.replace(
    /{renderDisposalAirmenList\(receptionList, 'RECEPTION', 'K\/O & Reception'\)}/g,
    "{renderDisposalAirmenList(receptionList, 'RECEPTION', isPtDocument ? 'Reception Duty' : 'K/O & Reception')}"
  );

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched Reception labels");
