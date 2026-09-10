const fs = require('fs');
const file = 'src/components/FlightDutyRatioModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findFunc = `      FLIGHTS.forEach(f => {
        let quota = quotas[f] || 0;
        const arr = new Array(31).fill(0);
        
        // Distribute quota evenly across 31 days
        // We use a simple spacing algorithm
        if (quota > 0) {
           const step = 31 / quota;
           let current = 0;
           for (let i = 0; i < quota; i++) {
              let idx = Math.floor(current);
              if (idx > 30) idx = 30;
              arr[idx]++;
              current += step;
           }
        }
        table!.data[f] = arr;
      });`;

const replaceFunc = `      let dailyReqs = table!.dailyRequirements || new Array(31).fill(0);
      const reqSum = dailyReqs.reduce((a, b) => a + b, 0);
      
      if (reqSum !== table!.totalRequiredMonth || reqSum === 0) {
          dailyReqs = new Array(31).fill(0);
          if (table!.totalRequiredMonth > 0) {
              const step = 31 / table!.totalRequiredMonth;
              let current = 0;
              for (let i = 0; i < table!.totalRequiredMonth; i++) {
                  let idx = Math.floor(current);
                  if (idx > 30) idx = 30;
                  dailyReqs[idx]++;
                  current += step;
              }
          }
          table!.dailyRequirements = dailyReqs;
      }
      
      const availableSlots: number[] = [];
      dailyReqs.forEach((count, dayIdx) => {
          for (let i = 0; i < count; i++) {
              availableSlots.push(dayIdx);
          }
      });
      
      const sortedFlights = FLIGHTS.map(f => ({ name: f, quota: quotas[f] || 0 })).sort((a, b) => b.quota - a.quota);
      
      const assignedData: Record<string, number[]> = {
          Mechanics: new Array(31).fill(0),
          Avionics: new Array(31).fill(0),
          GCS: new Array(31).fill(0),
          Admin: new Array(31).fill(0)
      };
      
      let slotIdx = 0;
      sortedFlights.forEach(fl => {
          const step = availableSlots.length / (fl.quota || 1);
          let current = 0;
          for (let i = 0; i < fl.quota; i++) {
              if (availableSlots.length > 0) {
                  const actualSlot = availableSlots[Math.floor(slotIdx + current) % availableSlots.length];
                  assignedData[fl.name][actualSlot]++;
              }
              current += step;
          }
          slotIdx += (step / 2);
      });
      
      FLIGHTS.forEach(f => {
          table!.data[f] = assignedData[f];
      });`;

content = content.replace(findFunc, replaceFunc);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated autodistribute in FlightDutyRatioModal!");
