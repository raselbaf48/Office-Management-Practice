import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const returnStatement = "return (\n    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>\n      {/* Left Sidebar Navigation */}";
const replaceWith = "return (\n    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>\n      {renderNoticeModal()}\n      {/* Left Sidebar Navigation */}";

if (code.includes(returnStatement) && !code.includes("{renderNoticeModal()}")) {
  code = code.replace(returnStatement, replaceWith);
  fs.writeFileSync('src/App.tsx', code);
  console.log("App.tsx fixed");
} else {
  console.log("Could not find replacement pattern in App.tsx");
}
