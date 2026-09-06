const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      res.json({
        dates: finalDates,
        textExtracted: true,
        source: 'OCR_and_Text_Parser'
      });`;

const replacement = `
      finalDates.sort((a, b) => a.date.localeCompare(b.date));

      let totalAssignmentsCount = 0;
      let matchedCount = 0;
      let unmatchedCount = 0;
      
      for (const d of finalDates) {
         totalAssignmentsCount += d.assignments.length;
         matchedCount += d.assignments.length;
      }

      if (finalDates.length === 0 || totalAssignmentsCount === 0) {
         return res.status(400).json({ error: 'No dates or duty assignments could be detected in the document. Please verify the document format.' });
      }

      res.json({
        documentTitle: \`OCR Extracted Duty Roster\`,
        detectedFlight: targetFlight,
        year: targetYear,
        month: finalDates[0] ? parseInt(finalDates[0].date.split('-')[1], 10) : 8,
        totalDates: finalDates.length,
        totalPages: fileList.length || 1,
        totalFiles: fileList.length || 1,
        dateRange: {
          start: finalDates[0]?.date || \`\${targetYear}-08-01\`,
          end: finalDates[finalDates.length - 1]?.date || \`\${targetYear}-08-31\`,
        },
        dates: finalDates,
        totalAssignmentsCount,
        matchedCount,
        unmatchedCount,
        textExtracted: true,
        source: 'OCR_and_Text_Parser'
      });`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Updated response structure");
} else {
    console.log("Could not find target string in server.ts");
}
