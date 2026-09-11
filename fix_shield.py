import re

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace "Calendar, Shield," back to "Calendar," if it exists
content = content.replace("Calendar, Shield,", "Calendar,")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed duplicate Shield import.")
