const fs = require('fs');

let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// The `bg-emerald-50 /40` came from the previous replacement `bg-emerald-50 \/40` -> `bg-emerald-50 dark:bg-emerald-950/20`. 
// But if it already was `bg-purple-50 /40` and I only replaced `purple` with `emerald`, it became `bg-emerald-50 /40`.
// Let's clean up these specific modal string glitches:
content = content.replace(/bg-emerald-50 \/40/g, 'bg-emerald-50 dark:bg-emerald-950/20');
content = content.replace(/bg-emerald-100 text-emerald-800 {3}border border-emerald-200 {2}shrink-0 ml-2/g, 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2');
content = content.replace(/bg-emerald-100 text-emerald-700 \/60/g, 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300');
content = content.replace(/text-emerald-700 {2}/g, 'text-emerald-700 dark:text-emerald-400 ');
content = content.replace(/border-emerald-200 {2}/g, 'border-emerald-200 dark:border-emerald-800/50 ');

// Fix the rest of `text-black` in edit modal fields!
const editModalFields = `bg-white  text-black outline-none focus:border-emerald-500`;
content = content.replace(/bg-white {2}text-black outline-none focus:border-emerald-500/g, 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-emerald-500');

// Fix `text-emerald-600  hover:`
content = content.replace(/text-emerald-600 {2}hover/g, 'text-emerald-600 dark:text-emerald-400 hover');
content = content.replace(/text-emerald-600 ">/g, 'text-emerald-600 dark:text-emerald-400">');

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log("Fixed emerald text and backgrounds");
