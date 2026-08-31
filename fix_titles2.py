import os
import re

files = [
    'src/components/NightCountStateView.tsx',
    'src/components/PrintableNightCountModal.tsx',
    'src/components/ParadeStateFormattedView.tsx',
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/DashboardParadeState.tsx'
]

replacements = {
    r'([>\s])ON PARADE([<\s])': r'\1On Parade\2',
    r'([>\s])ON PT([<\s])': r'\1On PT\2',
    r'([>\s])LEAVE([<\s])': r'\1Leave\2',
    r'([>\s])DUTY ON([<\s])': r'\1Duty On\2',
    r'([>\s])DUTY OFF([<\s])': r'\1Duty Off\2',
    r'([>\s])BAKE & BITE([<\s])': r'\1Bake & Bite\2',
    r'([>\s])SICK REPORT([<\s])': r'\1Sick Report\2',
    r'([>\s])ATT/TDY/DETT([<\s])': r'\1Det/Tdy\2',
    r'([>\s])RECEPTION([<\s])': r'\1Reception\2',
    r'([>\s])ADMIN ORDER([<\s])': r'\1Admin Order\2',
    r'([>\s])CLASS / TRG([<\s])': r'\1Class / Trg\2',
    r'([>\s])DRILL CAT-C([<\s])': r'\1Drill Cat-C\2',
    r'([>\s])G/H & GAMES([<\s])': r'\1G/H & Games\2',
    r'([>\s])ABSENT([<\s])': r'\1Absent\2',
}

for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    # Apply regex replacements carefully to only affect text content within tags
    for old, new in replacements.items():
        code = re.sub(r'>\s*' + old.replace(r'([>\s])', '').replace(r'([<\s])', '').replace('&', r'\&').replace('/', r'\/').replace('-', r'\-') + r'\s*<', '>' + new.replace(r'\1', '').replace(r'\2', '') + '<', code)

    with open(file_path, 'w') as f:
        f.write(code)

print("Updates applied")
