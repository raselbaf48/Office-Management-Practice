const fs = require('fs');

let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// We want to replace `purple` with `emerald` globally.
content = content.replace(/purple/g, 'emerald');

// We need to fix the `text-black` and missing dark classes in the modals.
// Modals start around line 1730 (Add Personnel Disposal)
const addModalIndex = content.indexOf('{showAddDisposal && (');
const editModalIndex = content.indexOf('{editDisposalModal && (');
const ratioModalIndex = content.indexOf('{showRatioModal && (');

if (addModalIndex > -1) {
  let pre = content.substring(0, addModalIndex);
  let post = content.substring(addModalIndex);

  // Fix the missing classes in the post section (modals area)
  post = post.replace(/text-black/g, 'text-slate-900 dark:text-white');
  post = post.replace(/text-slate-500 {2}/g, 'text-slate-500 dark:text-slate-400 ');
  post = post.replace(/text-emerald-700 {2}/g, 'text-emerald-700 dark:text-emerald-400 ');
  post = post.replace(/text-rose-700 {2}/g, 'text-rose-700 dark:text-rose-400 ');
  post = post.replace(/text-slate-700 {2}/g, 'text-slate-700 dark:text-slate-300 ');
  post = post.replace(/text-amber-900 {2}/g, 'text-amber-900 dark:text-amber-100 ');

  post = post.replace(/bg-emerald-50 \/40/g, 'bg-emerald-50 dark:bg-emerald-950/20');
  post = post.replace(/bg-rose-100 \/60/g, 'bg-rose-100 dark:bg-rose-950/40');
  post = post.replace(/bg-slate-50 \/50/g, 'bg-slate-50 dark:bg-slate-800/50');
  post = post.replace(/bg-white {2}/g, 'bg-white dark:bg-slate-900 ');
  post = post.replace(/bg-amber-50 \/40/g, 'bg-amber-50 dark:bg-amber-950/20');

  post = post.replace(/border-emerald-200 {2}/g, 'border-emerald-200 dark:border-emerald-800/50 ');
  post = post.replace(/border-rose-200 {2}/g, 'border-rose-200 dark:border-rose-900/50 ');
  post = post.replace(/border-slate-200 {2}/g, 'border-slate-200 dark:border-slate-700 ');
  post = post.replace(/border-slate-300 {2}/g, 'border-slate-300 dark:border-slate-700 ');
  post = post.replace(/border-amber-300 {2}/g, 'border-amber-300 dark:border-amber-700/50 ');

  // Fix button text on Add Disposal
  post = post.replace(/text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300/g, 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400');

  content = pre + post;
}

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');
console.log("Fixed modals!");
