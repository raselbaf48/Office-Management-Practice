import re

file_path = 'src/components/SignatureConfigModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="text-[11px] font-bold uppercase">{prepared.rank', 'className="text-[11px] font-bold">{prepared.rank')
content = content.replace('className="text-[11px] font-bold uppercase">{authorized.rank', 'className="text-[11px] font-bold">{authorized.rank')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Updated {file_path}")
