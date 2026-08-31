import os
import re

files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/DashboardParadeState.tsx']
for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    # Title changes
    replacements = {
        '>LEAVE<': '>Leave<',
        '>DUTY ON<': '>Duty On<',
        '>DUTY OFF<': '>Duty Off<',
        '>BAKE & BITE<': '>Bake & Bite<',
        '>SICK REPORT<': '>Sick Report<',
        '>ATT/TDY/DETT<': '>Det/Tdy<',
        '>RECEPTION<': '>Reception<',
        '>ADMIN ORDER<': '>Admin Order<',
        '>CLASS / TRG<': '>Class / Trg<',
        '>DRILL CAT-C<': '>Drill Cat-C<',
        '>G/H & GAMES<': '>G/H & Games<',
        '>ABSENT<': '>Absent<',
        "'ATT / TDY / DETT'": "'Det/Tdy'"
    }
    for old, new in replacements.items():
        code = code.replace(old, new)

    # Remove uppercase tracking-wide
    code = code.replace(
        'className="font-bold underline text-black mb-1 uppercase tracking-wide"',
        'className="font-bold underline text-black mb-1"'
    )
    code = code.replace(
        'className="font-bold underline text-gray-900 mb-1 uppercase tracking-wide"',
        'className="font-bold underline text-gray-900 mb-1"'
    )

    # Merge Air Fd Duty to dutyOnList
    code = code.replace(
        "airFdDutyList.push({ airman, note: 'Air Fd Duty' });",
        "dutyOnList.push({ airman, note: 'Air Fd Duty' });"
    )

    # Remove airFdDutyList rendering block
    pattern = r'\{\s*airFdDutyList\.length\s*>\s*0\s*&&\s*\([\s\S]*?renderDisposalAirmenList\(airFdDutyList,\s*\'ATT\',\s*\'Air Fd Duty\'\)\s*\}[\s\S]*?</div>\s*\)\s*\}'
    code = re.sub(pattern, '', code)
    
    # Clean up condition
    code = code.replace('airFdDutyList.length > 0 || ', '')

    # Remove airFdDutyList declaration
    code = re.sub(r'const\s+airFdDutyList\s*:\s*\{\s*airman\s*:\s*Airman\s*;\s*note\s*\?\s*:\s*string\s*\}\[\]\s*=\s*\[\];', '', code)
    
    with open(file_path, 'w') as f:
        f.write(code)

print("Parade State updated")
