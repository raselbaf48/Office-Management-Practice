import sys

with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code = f.read()

target1 = """      for (const flt of orderedFlights) {
        const required = getFlightDutyQuotaForDate(
          fromDate, 
          flt, 
          activeDutyCode,
          (activeDutyCode === "IDAC" || activeDutyCode === "IDA") ? activeIdaShift : undefined
        );
        
        if (required > 0) {
          const assignedCount = assignmentsList.filter((a) => {
            const airman = airmanMap.get(a.airmanId);
            return airman && 
                   airman.flightName === flt && 
                   a.dutyCode === activeDutyCode &&
                   (a.dutyCode !== "IDAC" && a.dutyCode !== "IDA" || a.idaShift === activeIdaShift);
          }).length;
          
          if (assignedCount < required) {
            targetFlight = flt;
            break;
          }
        }
      }
      
      setActiveFlight(targetFlight);"""

replacement1 = """      for (const flt of orderedFlights) {
        const required = getFlightDutyQuotaForDate(
          fromDate, 
          flt, 
          activeDutyCode,
          (activeDutyCode === "IDAC" || activeDutyCode === "IDA") ? activeIdaShift : undefined
        );
        
        if (required > 0) {
          const assignedCount = assignmentsList.filter((a) => {
            const airman = airmanMap.get(a.airmanId);
            return airman && 
                   airman.flightName === flt && 
                   a.dutyCode === activeDutyCode &&
                   (a.dutyCode !== "IDAC" && a.dutyCode !== "IDA" || a.idaShift === activeIdaShift);
          }).length;
          
          if (assignedCount < required) {
            targetFlight = flt;
            break;
          }
        }
      }
      
      // If all quotas are fulfilled, fallback to the first flight that has a quota
      if (targetFlight === "All") {
        for (const flt of orderedFlights) {
          const required = getFlightDutyQuotaForDate(
            fromDate, 
            flt, 
            activeDutyCode,
            (activeDutyCode === "IDAC" || activeDutyCode === "IDA") ? activeIdaShift : undefined
          );
          if (required > 0) {
            targetFlight = flt;
            break;
          }
        }
      }
      
      setActiveFlight(targetFlight);"""

if target1 in code:
    code = code.replace(target1, replacement1)
    print('Replaced target1!')
else:
    print('Target1 not found!')

target2 = """                        onClick={() => {
                          setActiveDutyCode(dt.code);
                          if (activeFlight === 'All') {
                            setSelectionMode('DutyFirst');
                          }
                        }}"""

replacement2 = """                        onClick={() => {
                          setActiveDutyCode(dt.code);
                          userManuallySelectedFlightRef.current = false;
                          if (activeFlight === 'All') {
                            setSelectionMode('DutyFirst');
                          }
                        }}"""

if target2 in code:
    code = code.replace(target2, replacement2)
    print('Replaced target2!')
else:
    print('Target2 not found!')

with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code)

