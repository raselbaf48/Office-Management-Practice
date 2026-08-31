import os

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(
    "airFdDuty: airFdDutyList.map((i) => i.airman),",
    "airFdDuty: [], // Merged into Duty On"
)

with open(file_path, 'w') as f:
    f.write(code)

print("Export reference fixed")
