import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_flight_click = """                        setSelectionMode('FlightFirst');
                        const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');"""

new_flight_click = """                        if (selectionMode === 'None' || !activeDutyCode) {
                          setSelectionMode('FlightFirst');
                        }
                        const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');"""

content = content.replace(old_flight_click, new_flight_click)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
