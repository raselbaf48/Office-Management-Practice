const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// The issue is that the text says "Today" but the logic is treating val=1 as "1 Day Span" which is technically true regardless of whether it's actually today's calendar date.
// The user wants "Today" to only be selected if the dates actually match the current calendar date. 
// Or perhaps they want the label to just be "1 Day", and "Today" is confusing.
// Looking at the screenshot, they shifted the date to "04 Sep", but the span is still 1 day, so the preset "Today" (which means span=1) remains highlighted.
// If the preset label says "Today", it shouldn't be highlighted if the date is not today.

code = code.replace(
  /\{label: 'Today', val: 1\}, \{label: '2 Days', val: 2\}/,
  `{label: '1 Day', val: 1}, {label: '2 Days', val: 2}`
);

fs.writeFileSync(file, code);
console.log('Fixed Today label');
