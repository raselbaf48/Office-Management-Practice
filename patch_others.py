import re

files = [
    'src/components/AssignDutyModal.tsx',
    'src/components/DashboardParadeState.tsx',
    'src/components/NightCountStateView.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add formatAirmanName function if not exists
    if "const formatAirmanName" not in content:
        format_func = """const formatAirmanName = (name: string) => {
  if (!name) return '';
  return name.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};\n"""
        # Insert after imports
        content = re.sub(r'(import .*?;[\n\r]+)(?=(?:import|const|interface))', r'\1' + format_func, content, count=1)

    content = content.replace('{item.airman.rank}', '{formatAirmanName(item.airman.rank)}')
    content = content.replace('{a.rank}', '{formatAirmanName(a.rank)}')
    content = content.replace('{preparedBy.rank}', '{formatAirmanName(preparedBy.rank)}')
    content = content.replace('{authorizedBy.rank}', '{formatAirmanName(authorizedBy.rank)}')
    content = content.replace('{activeEditCell.airman.rank}', '{formatAirmanName(activeEditCell.airman.rank)}')
    content = content.replace('{editDisposalModal.airman.rank}', '{formatAirmanName(editDisposalModal.airman.rank)}')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")
