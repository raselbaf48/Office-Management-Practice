import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Duty click handler
old_duty_click = "onClick={() => setActiveDutyCode(dt.code)}"
new_duty_click = """onClick={() => {
                          setActiveDutyCode(dt.code);
                          if (activeFlight === 'All') {
                            setSelectionMode('DutyFirst');
                          }
                        }}"""
content = content.replace(old_duty_click, new_duty_click)

# Replace Flight click handler
old_flight_click = """                  onClick={() => {
                    if (!isDisabledFlt) {
                      setActiveFlight(activeFlight === flt ? 'All' : flt);
                      userManuallySelectedFlightRef.current = true;
                    }
                  }}"""
new_flight_click = """                  onClick={() => {
                    if (!isDisabledFlt) {
                      const newFlt = activeFlight === flt ? 'All' : flt;
                      setActiveFlight(newFlt);
                      userManuallySelectedFlightRef.current = true;
                      
                      if (newFlt !== 'All') {
                        setSelectionMode('FlightFirst');
                        const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
                        const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code, undefined, newFlt) > 0);
                        if (ratioFiltered.length > 0) {
                          if (!activeDutyCode || !ratioFiltered.some(d => d.code === activeDutyCode)) {
                            setActiveDutyCode(ratioFiltered[0].code);
                          }
                        }
                      } else {
                        if (!activeDutyCode) {
                          setSelectionMode('None');
                        }
                      }
                    }
                  }}"""
content = content.replace(old_flight_click, new_flight_click)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
