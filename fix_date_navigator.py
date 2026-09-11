import re

file_path = 'src/components/DateNavigator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const month = d.toLocaleString('en-US', { month: 'short' });",
    "const month = d.toLocaleString('en-US', { month: 'short' }).replace(/Sept/gi, 'Sep');"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed DateNavigator.tsx")
