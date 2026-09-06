      const targetYear = 2026;
      const monthMap = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
      
      const parseDateMatch = (matchStr) => {
          matchStr = matchStr.replace(/(st|nd|rd|th)/i, '').trim();
          if (matchStr.includes('-') || matchStr.includes('/')) {
             let parts = matchStr.split(/[-/]/);
             if (parts[2].length === 2) parts[2] = '20' + parts[2];
             return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
             const parts = matchStr.split(/\s+/);
             const day = parts[0].padStart(2, '0');
             const monthKey = parts[1].substring(0, 3).toLowerCase();
             const month = monthMap[monthKey] || '08';
             let year = parts[2] || String(targetYear);
             if (year.length === 2) year = '20' + year;
             return `${year}-${month}-${day}`;
          }
      };
console.log(parseDateMatch("01 Aug"));
