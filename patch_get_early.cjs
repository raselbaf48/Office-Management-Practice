const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const getTarget = `export async function getDbFromFirebase() {
  try {`;

const getReplace = `export async function getDbFromFirebase() {
  if (quotaExceeded) return null;
  try {`;

if (code.includes(getTarget)) {
  code = code.replace(getTarget, getReplace);
  fs.writeFileSync('src/firebase.ts', code);
  console.log('Patched getDbFromFirebase early return');
} else {
  console.log('Target not found in getDbFromFirebase');
}
