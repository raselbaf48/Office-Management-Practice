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

    # The header wrappers
    code = code.replace('<div className="flex justify-between items-start mb-2">', '<div className="flex justify-between items-start mb-2 min-w-[700px] print:min-w-0">')
    code = code.replace('<div className="flex justify-between items-end mt-8 sm:mt-12">', '<div className="flex justify-between items-end mt-8 sm:mt-12 min-w-[700px] print:min-w-0">')
    code = code.replace('<div className="flex justify-between items-end mt-12">', '<div className="flex justify-between items-end mt-12 min-w-[700px] print:min-w-0">')

    with open(file_path, 'w') as f:
        f.write(code)

print("Headers fixed")
