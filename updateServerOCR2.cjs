const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const replacement = `
      const extractedDates = [];
      const resultMap = new Map(); // dateStr -> assignments[]
      
      let currentDateStr = null;
      
      // Match dd-mm-yyyy, dd/mm/yyyy, dd-mm-yy, or dd MMM (yy)
      const dateRegex = /\\b(?:0?[1-9]|[12][0-9]|3[01])(?:[-/](?:0?[1-9]|1[012])[-/](?:20\\d\\d|\\d\\d)|(?:st|nd|rd|th)?\\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\\s+(?:20\\d\\d|\\d\\d))?)\\b/gi;
      
      const monthMap = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
      
      const parseDateMatch = (matchStr) => {
          matchStr = matchStr.replace(/(st|nd|rd|th)/i, '').trim();
          if (matchStr.includes('-') || matchStr.includes('/')) {
             let parts = matchStr.split(/[-/]/);
             if (parts[2].length === 2) parts[2] = '20' + parts[2];
             return \`\${parts[2]}-\${parts[1].padStart(2, '0')}-\${parts[0].padStart(2, '0')}\`;
          } else {
             const parts = matchStr.split(/\\s+/);
             const day = parts[0].padStart(2, '0');
             const monthKey = parts[1].substring(0, 3).toLowerCase();
             const month = monthMap[monthKey] || '08';
             let year = parts[2] || String(targetYear);
             if (year.length === 2) year = '20' + year;
             return \`\${year}-\${month}-\${day}\`;
          }
      };
      
      for (const line of lines) {
         const dateMatch = line.match(dateRegex);
         if (dateMatch) {
            currentDateStr = parseDateMatch(dateMatch[0]);
            if (!resultMap.has(currentDateStr)) {
               resultMap.set(currentDateStr, []);
            }
         }
         
         let foundAirman = null;
         for (const a of airmen) {
            if (line.includes(a.bdNo) || line.includes('BD/' + a.bdNo) || line.toLowerCase().includes(a.name.toLowerCase())) {
               foundAirman = a;
               break;
            }
         }
         
         if (foundAirman) {
            let assignedDuty = null;
            let assignedShift = null;
            
            const upperLine = line.toUpperCase();
            
            for (const code of dutyCodes) {
               if (upperLine.includes(code)) {
                  assignedDuty = code;
                  break;
               }
            }
            
            if (!assignedDuty) {
               if (upperLine.includes('SICK') || upperLine.includes('S/Q')) assignedDuty = 'SICK_REPORT';
               else if (upperLine.includes('HOSP') || upperLine.includes('CMH')) assignedDuty = 'CMH';
               else if (upperLine.includes('BAKE')) assignedDuty = 'BAKE_N_BITE';
               else if (upperLine.includes('AIRFIELD')) assignedDuty = 'AIRFIELD_DUTY';
               else if (upperLine.includes('IDA')) assignedDuty = 'IDAC';
            }
            
            if (assignedDuty === 'IDAC') {
               if (upperLine.includes('MORN')) assignedShift = 'Morning';
               else if (upperLine.includes('AFT')) assignedShift = 'Afternoon';
               else if (upperLine.includes('NIGHT')) assignedShift = 'Night';
               else assignedShift = 'Morning';
            }
            
            // If no duty code found in text, check if it's a known table layout fallback
            if (!assignedDuty) assignedDuty = 'GD'; // optimistic fallback for OCR
            
            // Ensure we have a date
            let applyDate = currentDateStr;
            if (!applyDate) {
               // use fallback date
               const today = new Date();
               applyDate = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
            }
            
            if (!resultMap.has(applyDate)) resultMap.set(applyDate, []);
            const mapArr = resultMap.get(applyDate);
            
            if (!mapArr.find(x => x.bdNo === foundAirman.bdNo)) {
               mapArr.push({
                  bdNo: foundAirman.bdNo,
                  dutyCode: assignedDuty,
                  idaShift: assignedShift,
                  name: foundAirman.name,
                  rank: foundAirman.rank
               });
            }
         }
      }
      
      const finalDates = [];
      for (const [dateStr, assignments] of resultMap.entries()) {
         finalDates.push({
            date: dateStr,
            assignments: assignments
         });
      }
`;

// Replace from 'const extractedDates = [];' up to 'const finalDates = [];' loop end
const startTag = "const extractedDates = [];";
const endTag = "      res.json({";

const startIndex = serverCode.indexOf(startTag);
const endIndex = serverCode.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  serverCode = serverCode.substring(0, startIndex) + replacement + "\n" + serverCode.substring(endIndex);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Updated parse logic");
} else {
  console.error("Could not find blocks");
}
