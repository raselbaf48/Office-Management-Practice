import sys

with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code = f.read()

target = """              {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).filter(flt => {
                const matrixConfig = getStoredDutyMatrix().find(t => t.dutyCode === activeDutyCode);"""

replacement = """              {(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as Array<FlightName | 'All'>).filter(flt => {
                if (flt === 'All') return true;
                const matrixConfig = getStoredDutyMatrix().find(t => t.dutyCode === activeDutyCode);"""

if target in code:
    code = code.replace(target, replacement)
    print("Replaced target 1")
else:
    print("Target 1 not found")

target2 = """              }).map((flt) => {
                const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || (isPastDate && !isSuperAdmin);
                return (
                <button
                  key={flt}
                  type="button"
                  onClick={() => {
                    if (!isDisabledFlt) {
                      const newFlt = activeFlight === flt ? 'All' : flt;
                      setActiveFlight(newFlt);
                      
                      if (newFlt !== 'All') {
                        userManuallySelectedFlightRef.current = true;
                        if (selectionMode === 'None' || !activeDutyCode) {
                          setSelectionMode('FlightFirst');
                        }
                        const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
                        const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code, undefined, newFlt) > 0);
                        if (ratioFiltered.length > 0) {
                          if (!activeDutyCode || !ratioFiltered.some(d => d.code === activeDutyCode)) {
                            setActiveDutyCode(ratioFiltered[0].code);
                          }
                        }
                      } else {
                        // User explicitly clicked the active flight to deselect it.
                        // We lock the auto-selector so it doesn't force a flight based on the duty,
                        // and we keep the current duty selected.
                        userManuallySelectedFlightRef.current = true;
                        if (!activeDutyCode) {
                          setSelectionMode('None');
                        }
                      }
                    }
                  }}"""

replacement2 = """              }).map((flt) => {
                const isDisabledFlt = flt !== 'All' && ((isAdmin && adminFlight && flt !== adminFlight) || (isPastDate && !isSuperAdmin));
                return (
                <button
                  key={flt}
                  type="button"
                  onClick={() => {
                    if (!isDisabledFlt) {
                      if (activeFlight === flt) return; // Do not deselect on click
                      
                      const newFlt = flt;
                      setActiveFlight(newFlt);
                      
                      if (newFlt !== 'All') {
                        userManuallySelectedFlightRef.current = true;
                        if (selectionMode === 'None' || !activeDutyCode) {
                          setSelectionMode('FlightFirst');
                        }
                        const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
                        const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code, undefined, newFlt as FlightName) > 0);
                        if (ratioFiltered.length > 0) {
                          if (!activeDutyCode || !ratioFiltered.some(d => d.code === activeDutyCode)) {
                            setActiveDutyCode(ratioFiltered[0].code);
                          }
                        }
                      } else {
                        userManuallySelectedFlightRef.current = true;
                        if (!activeDutyCode) {
                          setSelectionMode('None');
                        }
                      }
                    }
                  }}"""

if target2 in code:
    code = code.replace(target2, replacement2)
    print("Replaced target 2")
else:
    print("Target 2 not found")
    
with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code)

