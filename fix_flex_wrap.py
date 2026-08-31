import os
import re

files = [
    'src/components/NightCountStateView.tsx',
    'src/components/PrintableNightCountModal.tsx',
]

for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    code = code.replace('<div className="flex flex-wrap items-start justify-between gap-6">', '<div className="flex flex-wrap items-start justify-between gap-6 min-w-[700px] print:min-w-0">')

    with open(file_path, 'w') as f:
        f.write(code)

print("Flex wrap classes injected")
