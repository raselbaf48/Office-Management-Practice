const fs = require('fs');

let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const calcStr = `
  // Calculate Auto Targets from localStorage
  const savedDuty = localStorage.getItem('baf_duty_distribution_total_duty');
  const savedManpower = localStorage.getItem('baf_duty_distribution_manpower');
  let autoTargets = null;
  if (savedDuty && savedManpower) {
    try {
      const totalDuty = JSON.parse(savedDuty);
      const manpower = JSON.parse(savedManpower);
      const totalCpl = manpower.mechCpl + manpower.aviCpl + manpower.gcsCpl + manpower.adminCpl;
      const totalSgt = manpower.mechSgt + manpower.aviSgt + manpower.gcsSgt + manpower.adminSgt;
      const totalAll = totalCpl + totalSgt;
      
      const dpp = {
        syDuty: totalCpl > 0 ? (totalDuty.syDuty / totalCpl) : 0,
        btfDuty: totalAll > 0 ? (totalDuty.btfDuty / totalAll) : 0,
        ntfDuty: totalAll > 0 ? (totalDuty.ntfDuty / totalAll) : 0,
        morning: totalAll > 0 ? (totalDuty.idacMorning / totalAll) : 0,
        afternoon: totalAll > 0 ? (totalDuty.idacAfternoon / totalAll) : 0,
        night: totalAll > 0 ? (totalDuty.idacNight / totalAll) : 0,
        reception: totalAll > 0 ? (totalDuty.reception / totalAll) : 0,
        airfield: totalAll > 0 ? (totalDuty.airfieldDuty / totalAll) : 0,
      };
      
      const getFltTargets = (cpl, sgt) => {
        const fltTotal = cpl + sgt;
        return {
          security_duty: dpp.syDuty * cpl,
          base_tf: dpp.btfDuty * fltTotal,
          nazirpara_tf: dpp.ntfDuty * fltTotal,
          idac_mor: dpp.morning * fltTotal,
          idac_an: dpp.afternoon * fltTotal,
          idac_nt: dpp.night * fltTotal,
          airport_duty: dpp.airfield * fltTotal
        };
      };
      
      autoTargets = {
        Mechanics: getFltTargets(manpower.mechCpl, manpower.mechSgt),
        Avionics: getFltTargets(manpower.aviCpl, manpower.aviSgt),
        GCS: getFltTargets(manpower.gcsCpl, manpower.gcsSgt),
        Admin: getFltTargets(manpower.adminCpl, manpower.adminSgt),
      };
    } catch(e){}
  }
`;

// Insert the calculation inside the component, before the return statement.
// Find `const flightTotalsOverall` and insert before it.

content = content.replace("const flightTotalsOverall: Record<FlightName, number> =", calcStr + "\n  const flightTotalsOverall: Record<FlightName, number> =");

// Then, replace `{table.flightTargets?.[flight]?.toFixed(2) || '0.00'}` with
// `{autoTargets?.[flight]?.[table.id]?.toFixed(2) || table.flightTargets?.[flight]?.toFixed(2) || '0.00'}`

content = content.replace("{table.flightTargets?.[flight]?.toFixed(2) || '0.00'}", "{autoTargets?.[flight]?.[table.id]?.toFixed(2) || table.flightTargets?.[flight]?.toFixed(2) || '0.00'}");

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf-8');
console.log('Patched DutyRatioMatrixView.tsx');
