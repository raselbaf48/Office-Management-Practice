const fs = require('fs');
let code = fs.readFileSync('src/utils/airmanMatcher.ts', 'utf8');

const regexToReplace = /let dateStr = '';\\n\s*let dayName = '';\\n\s*let lineContent = '';/g;
// We should replace it with stateful parsing
// Wait, I will just write a string replace.

let replacement = `
  let currentDateStr = '';
  let currentDayName = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    if (upperLine.includes('AVI FLT') || upperLine.includes('AVIONIC')) {
      currentFlight = 'Avionics';
    } else if (upperLine.includes('MECH FLT') || upperLine.includes('MECHANIC')) {
      currentFlight = 'Mechanics';
    } else if (upperLine.includes('GCS FLT') || upperLine.includes('GCS')) {
      currentFlight = 'GCS';
    } else if (upperLine.includes('ADMIN FLT') || upperLine.includes('ADMIN')) {
      currentFlight = 'Admin';
    }

    const sectionMatch = detectSectionDuty(line);
    if (sectionMatch && !line.match(dateRegex)) {
      activeSectionDuty = sectionMatch.code;
      activeSectionDutyName = sectionMatch.name;
      activeSectionIdaShift = sectionMatch.shift;
      continue;
    }

    let lineContent = line;

    const match = line.match(dateRegex);
    if (match) {
      const dayNum = match[1].padStart(2, '0');
      const monthStr = match[2].toLowerCase().slice(0, 3);
      const monthNum = monthMap[monthStr] || '08';
      currentDayName = match[3] || '';
      currentDateStr = \`\${targetYear}-\${monthNum}-\${dayNum}\`;
      lineContent = line.slice(match.index + match[0].length).replace(/^[\\s:—|]+/, '').trim();
    } else {
      const numMatch = line.match(numericDateRegex);
      if (numMatch) {
        if (numMatch[1]) {
          currentDateStr = \`\${numMatch[1]}-\${numMatch[2].padStart(2, '0')}-\${numMatch[3].padStart(2, '0')}\`;
        } else {
          const yr = numMatch[6].length === 2 ? \`20\${numMatch[6]}\` : numMatch[6];
          currentDateStr = \`\${yr}-\${numMatch[5].padStart(2, '0')}-\${numMatch[4].padStart(2, '0')}\`;
        }
        lineContent = line.slice(numMatch.index + numMatch[0].length).replace(/^[\\s:—|]+/, '').trim();
      }
    }
    
    // If we haven't found a date yet, try to assign to today or skip
    if (!currentDateStr) {
      const today = new Date();
      currentDateStr = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    }

    if (currentDateStr) {
      if (!dateMap.has(currentDateStr)) {
        dateMap.set(currentDateStr, { date: currentDateStr, dayName: currentDayName, assignments: [] });
      }
      const entry = dateMap.get(currentDateStr);
`;

const linesCode = code.split('\n');
const startIndex = linesCode.findIndex(l => l.includes('for (let i = 0; i < lines.length; i++) {'));
const endIndex = linesCode.findIndex((l, i) => i > startIndex && l.includes('// Process tokens in lineContent'));

if (startIndex !== -1 && endIndex !== -1) {
   let newLines = linesCode.slice(0, startIndex);
   newLines.push(replacement);
   newLines.push(linesCode.slice(endIndex).join('\n'));
   fs.writeFileSync('src/utils/airmanMatcher.ts', newLines.join('\n'));
   console.log("Successfully updated stateful date tracking");
} else {
   console.error("Could not find loop bounds");
}
