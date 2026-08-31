import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# Fix top banner
code = code.replace(
    '<div className="bg-white  border border-slate-200  rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">',
    '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">'
)

# Fix title
code = code.replace(
    "<span>155 UASU BAF • {isPtDocument ? 'Daily PT State' : 'Daily Parade State'}</span>",
    "<span>155 UASU BAF • Daily Night Count State</span>"
)
code = code.replace(
    "{isPtDocument ? 'Daily PT State' : 'Parade State Document'}",
    "'Night Count State'"
)
code = code.replace(
    '<h1 className="text-xl sm:text-2xl font-black text-black mt-1">',
    '<h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">'
)

# Fix date picker container
code = code.replace(
    '<div className="flex items-center bg-slate-100  px-3 py-1.5 rounded-xl border border-slate-200  text-xs font-bold space-x-2">',
    '<div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">'
)
code = code.replace(
    'className="bg-transparent text-black font-black outline-none cursor-pointer"',
    'className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"'
)

# Export Print Button behavior
code = code.replace(
    'onClick={handleDownloadDocx}',
    'onClick={() => setIsInternalPrintOpen(true)}'
)

# Add disposal modal background
code = code.replace(
    '<div className="bg-white  rounded-2xl',
    '<div className="bg-white dark:bg-slate-900 rounded-2xl'
)

code = code.replace(
    '<div className="bg-slate-50  px-6 py-4 border-b border-slate-100  flex items-center justify-between">',
    '<div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">'
)

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
