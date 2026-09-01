const fs = require('fs');

let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

// I need to replace `)}` at the end of the ternary if it's messed up.
// Let's just find the entire block and fix it.
content = content.replace(
  /\{livingType === 'L_IN' \? \([\s\S]*?\) : livingType === 'L_OUT' \? \([\s\S]*?\) : null\}/,
  (match) => {
    // wait this regex might be too greedy. Let's do it manually.
    return match;
  }
);
