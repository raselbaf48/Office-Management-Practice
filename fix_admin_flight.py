import os

file_path = 'src/components/DutyRatioMatrixView.tsx'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(
    "const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS'];",
    "const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];"
)

code = code.replace(
    "selectedFlightFilter as 'Mechanics' | 'Avionics' | 'GCS'",
    "selectedFlightFilter as 'Mechanics' | 'Avionics' | 'GCS' | 'Admin'"
)

with open(file_path, 'w') as f:
    f.write(code)

print("Fixed Admin flight in DutyRatioMatrixView")
