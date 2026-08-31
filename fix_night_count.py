import os

files = ['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx']
for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    # 1. Update Title
    code = code.replace(
        "isPtDocument ? 'NIGHT COUNT STATE : L/IN CPL & BELOW' : 'NIGHT COUNT STATE : L/IN CPL & BELOW'",
        "isPtDocument ? 'NIGHT COUNT STATE : AIRMEN' : 'NIGHT COUNT STATE : AIRMEN'"
    )

    # 2. Update Column Width and Rotation for Sqn/Unit
    code = code.replace(
        """<th className="border-r border-black p-2 align-bottom font-bold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Sqn/Unit</th>""",
        """<th className="border-r border-black p-2 align-bottom font-bold w-[120px]">Sqn/Unit</th>"""
    )
    code = code.replace(
        """<td className="border-r border-black p-2 font-bold whitespace-nowrap">155 UASU BAF</td>""",
        """<td className="border-r border-black p-2 font-bold whitespace-nowrap min-w-[120px]">155 UASU BAF</td>"""
    )
    
    # 3. Merge airFdDutyList into dutyOnList
    # First, let's change airFdDutyList.push to dutyOnList.push
    code = code.replace(
        "airFdDutyList.push({ airman, note: 'Air Fd Duty' });",
        "dutyOnList.push({ airman, note: 'Air Fd Duty' });"
    )

    with open(file_path, 'w') as f:
        f.write(code)

print("Updates applied part 1")
