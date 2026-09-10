const fs = require('fs');
const file = 'src/components/DutyRatioConfigPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const helper = `
// Helper function to auto-distribute duty data based on manpower
const autoDistributeTableData = (table: DutyRatioTable, currentManpower: any) => {
    const includesSgt = table.eligibleRanks ? table.eligibleRanks.includes('Sgt') : table.id !== 'security_duty';
    const isCplOnly = !includesSgt;
    const dutyTotal = table.totalRequiredMonth || 0;
    
    const flights = ['Mechanics', 'Avionics', 'GCS', 'Admin'];
    const flightPools: Record<string, number> = {};
    let actualPoolSize = 0;
    
    flights.forEach(fl => {
        let fltCpl = 0, fltSgt = 0;
        if (fl === 'Mechanics') { fltCpl = currentManpower.mechCpl; fltSgt = currentManpower.mechSgt; }
        if (fl === 'Avionics') { fltCpl = currentManpower.aviCpl; fltSgt = currentManpower.aviSgt; }
        if (fl === 'GCS') { fltCpl = currentManpower.gcsCpl; fltSgt = currentManpower.gcsSgt; }
        if (fl === 'Admin') { fltCpl = currentManpower.adminCpl; fltSgt = currentManpower.adminSgt; }
        
        let fltPool = isCplOnly ? fltCpl : (fltCpl + fltSgt);
        if (table.eligibleFlights && !table.eligibleFlights.includes(fl as any)) {
            fltPool = 0;
        }
        flightPools[fl] = fltPool;
        actualPoolSize += fltPool;
    });
    
    const flightQuotas: Record<string, number> = { Mechanics: 0, Avionics: 0, GCS: 0, Admin: 0 };
    
    if (dutyTotal > 0 && actualPoolSize > 0) {
        const exactVals = flights.map(fl => {
            const exact = (flightPools[fl] / actualPoolSize) * dutyTotal;
            return { flight: fl, exact: exact, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
        });
        
        let allocated = 0;
        exactVals.forEach(item => { flightQuotas[item.flight] = item.floor; allocated += item.floor; });
        let remaining = dutyTotal - allocated;
        
        const sortedForDistribution = [...exactVals]
            .filter(item => flightPools[item.flight] > 0)
            .sort((a, b) => b.remainder - a.remainder);
            
        for (let i = 0; i < remaining && i < sortedForDistribution.length; i++) {
            flightQuotas[sortedForDistribution[i].flight] += 1;
        }
    }
    
    if (!table.data) table.data = { Mechanics: [], Avionics: [], GCS: [], Admin: [] } as any;
    
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
    
    return table;
};

export interface DutyRatioConfigPanelProps`;

content = content.replace("export interface DutyRatioConfigPanelProps", helper);

const applyToAllFind = `                              if (onMatrixChange) {
                                const updated = [...matrix];
                                updated[settingsTableIdx].dailyRequirements = new Array(31).fill(val);
                                updated[settingsTableIdx].totalRequiredDaily = val;
                                updated[settingsTableIdx].totalRequiredMonth = val * 31;
                                onMatrixChange(updated);
                              }`;
const applyToAllRepl = `                              if (onMatrixChange) {
                                const updated = [...matrix];
                                updated[settingsTableIdx] = { ...updated[settingsTableIdx] };
                                updated[settingsTableIdx].dailyRequirements = new Array(31).fill(val);
                                updated[settingsTableIdx].totalRequiredDaily = val;
                                updated[settingsTableIdx].totalRequiredMonth = val * 31;
                                updated[settingsTableIdx] = autoDistributeTableData(updated[settingsTableIdx], manpower);
                                onMatrixChange(updated);
                              }`;

content = content.replace(applyToAllFind, applyToAllRepl);

const saveChangesFind = `                    if (matrix && onMatrixChange) {
                      const newMatrix = [...matrix];
                      newMatrix[editingDutyIdx] = {
                        ...newMatrix[editingDutyIdx],
                        title: editDutyName,
                        eligibleFlights: editDutyFlights,
                        eligibleRanks: editDutyRanks
                      };
                      onMatrixChange(newMatrix);
                    }`;

const saveChangesRepl = `                    if (matrix && onMatrixChange) {
                      const newMatrix = [...matrix];
                      newMatrix[editingDutyIdx] = autoDistributeTableData({
                        ...newMatrix[editingDutyIdx],
                        title: editDutyName,
                        eligibleFlights: editDutyFlights,
                        eligibleRanks: editDutyRanks
                      }, manpower);
                      onMatrixChange(newMatrix);
                    }`;

content = content.replace(saveChangesFind, saveChangesRepl);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched successfully!");
