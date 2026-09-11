import re
import glob

# For all components, try to replace common rank placeholders with formatted versions
for file_path in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # We won't blindly add formatAirmanName everywhere, but if a file has it, we can use it.
    # If it doesn't, we can add it.
    
    patterns_to_replace = [
        (r'\{airman\.rank\}', '{formatAirmanName(airman.rank)}'),
        (r'\{row\.airman\.rank\}', '{formatAirmanName(row.airman.rank)}'),
        (r'\{selectedAirman\.rank\}', '{formatAirmanName(selectedAirman.rank)}'),
        (r'\{it\.airman\.rank\}', '{formatAirmanName(it.airman.rank)}'),
        (r'\{u\.rank\}', '{formatAirmanName(u.rank)}'),
        (r'\{user\.rank\}', '{formatAirmanName(user.rank)}'),
    ]
    
    for pat, rep in patterns_to_replace:
        content = re.sub(pat, rep, content)
        
    if content != original:
        if "const formatAirmanName" not in content:
            imports = re.findall(r'^import .*?;\s*', content, re.MULTILINE)
            if imports:
                last_import = imports[-1]
                format_func = "\nconst formatAirmanName = (name: string) => {\n  if (!name) return '';\n  return name.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');\n};\n"
                content = content.replace(last_import, last_import + format_func)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
