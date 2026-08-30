const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRosterPeriodView.tsx', 'utf8');

const targetFunction = /const buildSectionItems = \(dutyFilter: \(code: string\) => boolean\): RosterExportItem\[\] => \{.*?\n  \};/gs;

const newFunction = `const buildSectionItems = (dutyFilter: (code: string) => boolean): RosterExportItem[] => {
    // Collect all duty assignments matching filter in the active dates
    const assignmentsByDate = new Map<string, DutyAssignment[]>();
    activeDates.forEach(dStr => {
      const dayAss = assignments.filter((a) => a.date === dStr && dutyFilter(a.dutyCode));
      assignmentsByDate.set(dStr, dayAss);
    });

    // Extract all unique airmen involved
    const involvedAirmenIds = new Set<string>();
    assignmentsByDate.forEach(assList => {
      assList.forEach(a => involvedAirmenIds.add(a.airmanId));
    });

    // Create blocks of consecutive duties for each airman
    interface DutyBlock {
      airman: Airman;
      startDate: string;
      endDate: string;
      dates: string[];
    }
    const allBlocks: DutyBlock[] = [];

    involvedAirmenIds.forEach(airmanId => {
      const airman = airmen.find(a => a.id === airmanId);
      if (!airman) return;

      // get dates this airman has duty, sorted chronologically
      const airmanDates = activeDates.filter(dStr => {
        const dayAss = assignmentsByDate.get(dStr);
        return dayAss && dayAss.some(a => a.airmanId === airmanId);
      });

      if (airmanDates.length === 0) return;

      let currentBlock: DutyBlock = { airman, startDate: airmanDates[0], endDate: airmanDates[0], dates: [airmanDates[0]] };
      
      for (let i = 1; i < airmanDates.length; i++) {
        const prevDate = new Date(airmanDates[i - 1]);
        const currDate = new Date(airmanDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          // Consecutive
          currentBlock.endDate = airmanDates[i];
          currentBlock.dates.push(airmanDates[i]);
        } else {
          // Break in sequence -> push old block, start new
          allBlocks.push(currentBlock);
          currentBlock = { airman, startDate: airmanDates[i], endDate: airmanDates[i], dates: [airmanDates[i]] };
        }
      }
      allBlocks.push(currentBlock);
    });

    // Sort all blocks primarily by start date, then by rank seniority
    allBlocks.sort((a, b) => {
      return a.startDate.localeCompare(b.startDate);
    });

    const output: RosterExportItem[] = [];
    let serCounter = 1;

    allBlocks.forEach(block => {
      const getDayNum = (dStr: string) => parseInt(dStr.split('-')[2], 10);
      const startDay = getDayNum(block.startDate);
      const endDay = getDayNum(block.endDate);
      
      let dateRangeStr = \`\${startDay}\`;
      if (startDay !== endDay) {
         dateRangeStr = \`\${startDay}-\${endDay}\`;
      }

      output.push({
        serNo: String(serCounter).padStart(2, '0'),
        bdNo: block.airman.bdNo.replace('BD/', ''),
        rank: block.airman.rank,
        name: block.airman.name,
        trade: block.airman.trade,
        block: block.airman.addressBlock || 'L/O',
        mobileNo: block.airman.mobileNo || '-',
        dateStr: dateRangeStr,
        section: '155 UASU',
      });
      serCounter++;
    });

    return output;
  };`;

code = code.replace(targetFunction, newFunction);
fs.writeFileSync('src/components/DutyRosterPeriodView.tsx', code);
