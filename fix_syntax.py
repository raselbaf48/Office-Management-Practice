import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r"\'Sgt\'", "'Sgt'")
content = content.replace(r"\'FLT LT\'", "'FLT LT'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed syntax in docxExport.ts")
