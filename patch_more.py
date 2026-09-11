import re

files = [
    'src/components/AssignDeploymentTab.tsx',
    'src/components/LeaveRegisterView.tsx',
    'src/components/EntryHistoryModal.tsx',
    'src/components/TdyRegisterView.tsx',
    'src/components/IdacDutyAssignModal.tsx',
    'src/components/DutyRatioConfigPanel.tsx',
    'src/components/AssignLeaveTab.tsx',
    'src/components/MonthlyDutyRegister.tsx',
    'src/components/DeploymentRegisterView.tsx',
    'src/components/PdfDutyImportModal.tsx',
    'src/components/AssignTdyTab.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add formatAirmanName function if not exists
    if "const formatAirmanName" not in content:
        # Find last import
        imports = re.findall(r'^import .*?;\s*', content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            format_func = "\nconst formatAirmanName = (name: string) => {\n  if (!name) return '';\n  return name.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');\n};\n"
            content = content.replace(last_import, last_import + format_func)

    content = content.replace('{a.rank}', '{formatAirmanName(a.rank)}')
    content = content.replace('{item.airman.rank}', '{formatAirmanName(item.airman.rank)}')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")
