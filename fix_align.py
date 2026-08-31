import os

files = ['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx']
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace('align-bottom', 'align-middle')
    with open(f, 'w') as file:
        file.write(content)

print("Alignment fixed")
