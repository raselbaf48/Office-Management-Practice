import os
import re

files = [
    'src/components/NightCountStateView.tsx',
    'src/components/PrintableNightCountModal.tsx',
    'src/components/ParadeStateFormattedView.tsx',
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/DashboardParadeState.tsx'
]

for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    code = re.sub(r'>\s*ON PARADE\s*<', '>\n                    On Parade\n                  <', code)
    code = re.sub(r'>\s*ON PT\s*<', '>\n                    On PT\n                  <', code)
    code = re.sub(r'>\s*LEAVE\s*<', '>\n                            Leave\n                          <', code)
    code = re.sub(r'>\s*DUTY ON\s*<', '>\n                            Duty On\n                          <', code)
    code = re.sub(r'>\s*DUTY OFF\s*<', '>\n                            Duty Off\n                          <', code)
    code = re.sub(r'>\s*BAKE & BITE\s*<', '>\n                            Bake & Bite\n                          <', code)
    code = re.sub(r'>\s*ESSN\s*<', '>\n                            ESSN\n                          <', code)
    code = re.sub(r'>\s*CMH\s*<', '>\n                            CMH\n                          <', code)
    code = re.sub(r'>\s*SICK REPORT\s*<', '>\n                            Sick Report\n                          <', code)
    code = re.sub(r'>\s*ATT/TDY/DETT\s*<', '>\n                            Det/Tdy\n                          <', code)
    code = re.sub(r'>\s*RECEPTION\s*<', '>\n                            Reception\n                          <', code)
    code = re.sub(r'>\s*ADMIN ORDER\s*<', '>\n                            Admin Order\n                          <', code)
    code = re.sub(r'>\s*CLASS / TRG\s*<', '>\n                            Class / Trg\n                          <', code)
    code = re.sub(r'>\s*DRILL CAT-C\s*<', '>\n                            Drill Cat-C\n                          <', code)
    code = re.sub(r'>\s*G/H & GAMES\s*<', '>\n                            G/H & Games\n                          <', code)
    code = re.sub(r'>\s*ABSENT\s*<', '>\n                            Absent\n                          <', code)

    with open(file_path, 'w') as f:
        f.write(code)

print("Updates applied completely")
