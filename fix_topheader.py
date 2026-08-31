import os

file_path = 'src/components/TopHeader.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("title: 'Daily Parade State (Official Format)'", "title: 'Daily Parade State'")
content = content.replace("title: 'Daily PT State (Physical Training Report)'", "title: 'Daily PT State'")

with open(file_path, 'w') as f:
    f.write(content)
print("TopHeader fixed")
