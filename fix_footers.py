import os

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

    code = code.replace('className="hidden flex justify-between items-end pt-1 text-black text-xs"', 'className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"')
    code = code.replace('className="flex justify-between items-end pt-1 text-black text-xs"', 'className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"')

    with open(file_path, 'w') as f:
        f.write(code)

print("Footers fixed")
