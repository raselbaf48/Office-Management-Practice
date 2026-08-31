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

    # 1. Remove table-fixed
    code = code.replace('table-fixed', 'table-auto')
    
    # 2. Add min-w-[750px] or min-w-[800px] to the inner wrapper.
    # In NightCountStateView and ParadeStateFormattedView, the children of `id="official-parade-document"` depend on loading states.
    # Let's find: `id="official-parade-document"` and its className. 
    # Wait, the simplest fix is to add `min-w-[800px] print:min-w-0` to the first div inside the loading/success condition, OR just replace `className="w-full text-center...` with `className="w-full min-w-[800px] text-center...` on the tables, AND add `min-w-[800px]` to the bottom list flex container.
    # Let's just wrap the inner content!
    # Instead of regex magic, let's just make the tables min-w-[800px] print:min-w-0 
    
    code = code.replace('<table className="w-full', '<table className="w-full min-w-[700px] print:min-w-0')
    
    # And for the bottom list in Night Count State, there's a `<div className="flex flex-col md:flex-row gap-6 mt-8">` or similar
    # Let's add min-w-[700px] to the flex container of the bottom lists in Night Count
    code = code.replace('<div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-6">', '<div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-6 min-w-[700px] print:min-w-0">')
    code = code.replace('<div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-8">', '<div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-8 min-w-[700px] print:min-w-0">')
    
    # For Parade State, it has `<div className="grid grid-cols-2 md:grid-cols-4 gap-6">`
    code = code.replace('<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">', '<div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 min-w-[700px] print:min-w-0">')
    code = code.replace('<div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">', '<div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 min-w-[700px] print:min-w-0">')

    # Add min-w to the header titles part so they don't squish
    code = code.replace('<div className="flex justify-between items-start mb-6">', '<div className="flex justify-between items-start mb-6 min-w-[700px] print:min-w-0">')
    code = code.replace('<div className="flex justify-between items-start mb-4">', '<div className="flex justify-between items-start mb-4 min-w-[700px] print:min-w-0">')
    
    with open(file_path, 'w') as f:
        f.write(code)

print("Classes injected")
