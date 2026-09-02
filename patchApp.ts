import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badBlockStart = '<button onClick={() => setHasSeenNotice(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">\n            I Understand\n          </button>';

if (code.includes('I Understand')) {
  // We'll replace the hardcoded "Important Notice"
  code = code.replace(
    '<h2 className="text-xl font-black text-slate-900 dark:text-white">Important Notice</h2>',
    '<h2 className="text-xl font-black text-slate-900 dark:text-white">{appConfig.notice.heading || "Important Notice"}</h2>'
  );
  
  // We'll remove the "I Understand" button
  code = code.replace(
    /          <button onClick=\{\(\) => setHasSeenNotice\(true\)\} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">\n            I Understand\n          <\/button>/g,
    ''
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("App.tsx updated");
} else {
  console.log("I Understand not found in App.tsx");
}
