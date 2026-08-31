import os
import re

files = ['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx']
for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    code = re.sub(r'const\s+airFdDutyList\s*:\s*\{\s*airman\s*:\s*Airman\s*;\s*note\s*\?\s*:\s*string\s*\}\[\]\s*=\s*\[\];', '', code)

    with open(file_path, 'w') as f:
        f.write(code)

print("Unused removed")
