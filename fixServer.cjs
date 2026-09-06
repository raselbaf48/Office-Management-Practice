const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const targetString = "// 8.1. Direct Load Official";
const endpointCode = `
  app.post('/api/import/analyze-duty-doc', async (req, res) => {
    try {
      const { fileBase64, files, mimeType, textSnippet, targetYear = 2026, targetFlight = 'Overall' } = req.body || {};

      const fileList = [];
      if (Array.isArray(files) && files.length > 0) {
        for (const f of files) {
          if (f.fileBase64 || f.base64) {
            fileList.push({
              base64: f.fileBase64 || f.base64,
              mime: f.mimeType || f.mime || 'application/pdf',
              name: f.fileName || f.name || 'Document',
            });
          }
        }
      } else if (fileBase64) {
        fileList.push({
          base64: fileBase64,
          mime: mimeType || 'application/pdf',
          name: 'Document',
        });
      }

      if (fileList.length === 0 && !textSnippet) {
        return res.status(400).json({ error: 'No file data or text provided for analysis' });
      }

      let combinedText = textSnippet || '';

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const buffer = Buffer.from(file.base64.split(',').pop() || '', 'base64');
        
        try {
          if (file.mime === 'application/pdf') {
            const pdfData = await PDFParseClass(buffer);
            combinedText += '\\n--- PDF PAGE ---\\n' + pdfData.text;
          } else if (file.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mime.includes('word')) {
            const result = await mammoth.extractRawText({ buffer });
            combinedText += '\\n--- DOCX CONTENT ---\\n' + result.value;
          } else if (file.mime.startsWith('image/')) {
            console.log("Running Tesseract OCR on image...");
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
            combinedText += '\\n--- OCR IMAGE CONTENT ---\\n' + text;
          } else {
             combinedText += '\\n' + buffer.toString('utf8');
          }
        } catch (e) {
          console.error("Error parsing file", file.name, e);
        }
      }

      const db = loadDatabase();
      const airmen = db.airmen;
      const dutyCodes = ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRFIELD_DUTY', 'LEAVE', 'IDAC', 'DUTY_OFF', 'ON_PARADE', 'BAKE_N_BITE', 'ESSN', 'CMH', 'SICK_REPORT', 'DRILL_CAT_C', 'RECEPTION', 'TDY', 'ADMIN_ORDER', 'CLASS_TRG', 'GAMES', 'ABSENT'];
      
      const lines = combinedText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
      const resultMap = new Map();
      let currentDateStr = null;
      
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
         // match date
         // Need to clone regex because we use it as /g inside a loop or test, wait, line.match(/g) doesn't use lastIndex
         const dateMatch = line.match(dateRegex);
         if (dateMatch && dateMatch.length > 0) {
            currentDateStr = parseDateMatch(dateMatch[0]);
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
            
            if (!assignedDuty) assignedDuty = 'GD';
            
            let applyDate = currentDateStr;
            if (!applyDate) {
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

      res.json({
        dates: finalDates,
        textExtracted: true,
        source: 'OCR_and_Text_Parser'
      });
      
    } catch (err) {
      console.error('Error in analyze-duty-doc:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze duty document' });
    }
  });

`;

serverCode = serverCode.replace(targetString, endpointCode + targetString);
fs.writeFileSync('server.ts', serverCode);
console.log("Restored analyze-duty-doc endpoint");
