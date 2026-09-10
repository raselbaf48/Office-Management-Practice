const fs = require('fs');
const file = 'src/components/DutyRatioConfigPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const findFunc = `    if (!table.data) table.data = { Mechanics: [], Avionics: [], GCS: [], Admin: [] } as any;
    
    flights.forEach(f => {
        let quota = flightQuotas[f] || 0;
        const arr = new Array(31).fill(0);
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
        table.data[f as any] = arr;
    });
    
    return table;`;

const replaceFunc = `    if (!table.data) table.data = { Mechanics: [], Avionics: [], GCS: [], Admin: [] } as any;
    
    // Determine daily slots. If dailyRequirements is present and its sum matches dutyTotal, use it.
    // Otherwise, generate a default dailyRequirements that perfectly spreads dutyTotal.
    let dailyReqs = table.dailyRequirements || new Array(31).fill(0);
    const reqSum = dailyReqs.reduce((a, b) => a + b, 0);
    
    if (reqSum !== dutyTotal || reqSum === 0) {
        dailyReqs = new Array(31).fill(0);
        if (dutyTotal > 0) {
            const step = 31 / dutyTotal;
            let current = 0;
            for (let i = 0; i < dutyTotal; i++) {
                let idx = Math.floor(current);
                if (idx > 30) idx = 30;
                dailyReqs[idx]++;
                current += step;
            }
        }
        table.dailyRequirements = dailyReqs; // Update it so UI shows perfectly
    }
    
    // Create an array of available slots based on dailyReqs
    const availableSlots: number[] = [];
    dailyReqs.forEach((count, dayIdx) => {
        for (let i = 0; i < count; i++) {
            availableSlots.push(dayIdx);
        }
    });
    
    // Sort flights by quota descending to assign the biggest quotas first
    const sortedFlights = flights.map(f => ({ name: f, quota: flightQuotas[f] || 0 })).sort((a, b) => b.quota - a.quota);
    
    const assignedData: Record<string, number[]> = {
        Mechanics: new Array(31).fill(0),
        Avionics: new Array(31).fill(0),
        GCS: new Array(31).fill(0),
        Admin: new Array(31).fill(0)
    };
    
    // Distribute quotas evenly across the available slots
    let slotIdx = 0;
    sortedFlights.forEach(fl => {
        const step = availableSlots.length / fl.quota;
        let current = 0;
        for (let i = 0; i < fl.quota; i++) {
            // Assign to the slot
            const actualSlot = availableSlots[Math.floor(slotIdx + current) % availableSlots.length];
            assignedData[fl.name][actualSlot]++;
            current += step;
        }
        slotIdx += (step / 2); // Offset to avoid overlapping same days too much
    });
    
    table.data = assignedData as any;
    
    return table;`;

content = content.replace(findFunc, replaceFunc);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated autodistribute!");
