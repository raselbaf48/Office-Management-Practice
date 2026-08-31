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

    code = code.replace("'ON PARADE'", "'On Parade'")
    code = code.replace("'ON PT'", "'On PT'")

    # Also remove uppercase tracking-wide from that h3 tag
    code = code.replace(
        'className="font-bold underline text-black mb-1.5 uppercase tracking-wide"',
        'className="font-bold underline text-black mb-1.5"'
    )
    code = code.replace(
        'className="font-bold underline text-gray-900 mb-1.5 uppercase tracking-wide"',
        'className="font-bold underline text-gray-900 mb-1.5"'
    )

    with open(file_path, 'w') as f:
        f.write(code)

print("On Parade fixed")
