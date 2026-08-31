import os
import re

files = ['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx']
for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r') as f:
        code = f.read()

    # Change disposal titles from uppercase to running case
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

    # Remove uppercase tracking-wide from h3 classes
    code = code.replace(
        'className="font-bold underline text-black mb-1 uppercase tracking-wide"',
        'className="font-bold underline text-black mb-1"'
    )

    # Remove airFdDutyList block
    # We will just regex replace the whole airFdDutyList render block
    pattern = r'\{\s*airFdDutyList\.length\s*>\s*0\s*&&\s*\([\s\S]*?renderDisposalAirmenList\(airFdDutyList,\s*\'ATT\',\s*\'Air Fd Duty\'\)\s*\}[\s\S]*?</div>\s*\)\s*\}'
    code = re.sub(pattern, '', code)
    
    # Also clean up the check condition
    code = code.replace('airFdDutyList.length > 0 || ', '')

    with open(file_path, 'w') as f:
        f.write(code)

print("Updates applied part 2")
