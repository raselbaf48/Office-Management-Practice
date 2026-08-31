import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# 1. Update filter logic
new_filter = """if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    const isLOut = block.includes('qtr') || 
                   block.includes('quarter') || 
                   block.includes('outside') ||
                   block.includes('l/o') ||
                   block.includes('l/out') ||
                   block.includes('living out') ||
                   block.includes('dhaka') ||
                   block.includes('mirpur') ||
                   block.includes('cantt') ||
                   block === 'lo' || 
                   block === 'l o';
    return !isLOut;"""

# Need to replace it everywhere I added it.
code = re.sub(
    r"if \(!\['CPL', 'Cpl', 'LAC', 'AC'\]\.includes\(a\.rank\)\) return false;\s*const block = \(a\.addressBlock \|\| ''\)\.toLowerCase\(\);\s*return !\(block\.includes\('qtr'\) \|\| block\.includes\('quarter'\) \|\| block\.includes\('outside'\)\);",
    new_filter,
    code
)

code = re.sub(
    r"\!\(a\.addressBlock\|\|''\)\.toLowerCase\(\)\.includes\('qtr'\) && \!\(a\.addressBlock\|\|''\)\.toLowerCase\(\)\.includes\('quarter'\) && \!\(a\.addressBlock\|\|''\)\.toLowerCase\(\)\.includes\('outside'\)",
    r"!(a.addressBlock||'').toLowerCase().includes('qtr') && !(a.addressBlock||'').toLowerCase().includes('quarter') && !(a.addressBlock||'').toLowerCase().includes('outside') && !(a.addressBlock||'').toLowerCase().includes('l/o') && !(a.addressBlock||'').toLowerCase().includes('l/out') && !(a.addressBlock||'').toLowerCase().includes('dhaka') && !(a.addressBlock||'').toLowerCase().includes('mirpur') && !(a.addressBlock||'').toLowerCase().includes('cantt')",
    code
)

# 2. Table Font color and background
code = code.replace('text-slate-900 dark:text-slate-100', 'text-black')
code = code.replace('text-slate-900 dark:text-white', 'text-black')
code = code.replace('text-slate-900', 'text-black')
code = code.replace('text-white', 'text-white') # leave white buttons alone!
# Actually, let's just make the table strictly text-black and border-black
code = code.replace('border-slate-900 dark:border-slate-300', 'border-black')
code = code.replace('border-slate-800', 'border-black')
# For background of tr
code = code.replace('bg-white dark:bg-slate-950', 'bg-white')
# Remove dark: text/bg classes from table
code = re.sub(r'dark:(bg|text|border)-[a-z0-9\-]+', '', code)

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
