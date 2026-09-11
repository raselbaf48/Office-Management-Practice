import re

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<h2 className="text-sm font-bold text-slate-900 dark:text-white ">State Controls</h2>',
    '<h2 className="text-sm font-bold text-slate-900 dark:text-white ">{isPtDocument ? \'PT State Controls\' : \'Parade State Controls\'}</h2>'
)

content = content.replace(
    '<p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Select date range and flight</p>',
    '<p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Manage {isPtDocument ? \'PT\' : \'parade\'} date, flight and display settings</p>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched State Controls in ParadeStateFormattedView.tsx")
