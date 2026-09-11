import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We remove the .toLowerCase() step in formatAirmanName to preserve case of ranks (like Sgt -> Sgt instead of Sgt, but wait, 'Sgt'.toLowerCase().split... would capitalize it back to Sgt.)
    # The issue is probably the `airman.rank` is passed to formatAirmanName which capitalizes the first letter and lowercases the rest (e.g. SGT -> Sgt).
    # But wait, the user wants "rank Sob Running letter e kno. Nominal roll e jevabe thakbe oivabe hbe".
    # This means they want the rank/name EXACTLY as it is in the database (which is likely uppercase like SGT, LAC, CPL).
    # So we should just remove the call to formatAirmanName for rank! Or just let formatAirmanName return the string as is, OR just change it so rank is not passed to it.
    
    # Actually, the simplest fix is to just return the string exactly as it is in formatAirmanName across all files!
    
    new_func = "const formatAirmanName = (name: string) => {\n  return name || '';\n};"
    
    import re
    # Replace the formatAirmanName implementation
    pattern = re.compile(r'const formatAirmanName = \(name: string\) => \{.*?return name\.toLowerCase\(\)\.split\(\' \'\)\.map\(\(w\) => w\.charAt\(0\)\.toUpperCase\(\) \+ w\.slice\(1\)\)\.join\(\' \'\);\n\};', re.DOTALL)
    
    if pattern.search(content):
        content = pattern.sub(new_func, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

import glob

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

