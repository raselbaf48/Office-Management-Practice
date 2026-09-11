import re

file_path = 'src/components/PrintableNightCountModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('{item.airman.rank}', '{formatAirmanName(item.airman.rank)}')
content = content.replace('{a.rank}', '{formatAirmanName(a.rank)}')
content = content.replace('{preparedBy.rank}', '{formatAirmanName(preparedBy.rank)}')
content = content.replace('{authorizedBy.rank}', '{formatAirmanName(authorizedBy.rank)}')
content = content.replace('{activeEditCell.airman.rank}', '{formatAirmanName(activeEditCell.airman.rank)}')
content = content.replace('{editDisposalModal.airman.rank}', '{formatAirmanName(editDisposalModal.airman.rank)}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Updated {file_path}")
