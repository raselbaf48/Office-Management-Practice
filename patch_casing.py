import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update toDisplay
content = content.replace(
    "const toDisplay = (airmenList: Airman[]) => airmenList.map((a) => ({ displayName: `${a.rank} ${a.name}` }));",
    "const toDisplay = (airmenList: Airman[]) => airmenList.map((a) => ({ displayName: `${formatRunningLetter(a.rank)} ${formatRunningLetter(a.name)}` }));"
)

content = content.replace(
    "displayName: `${item.airman.rank} ${item.airman.name} - ${dutyNote}`",
    "displayName: `${formatRunningLetter(item.airman.rank)} ${formatRunningLetter(item.airman.name)} - ${dutyNote}`"
)

# Replace all upper case section titles with formatRunningLetter
# E.g. buildDisposalSection('CANTEEN', ...) -> buildDisposalSection('Canteen', ...)
replacements = {
    "'CANTEEN'": "'Canteen'",
    "'LEAVE'": "'Leave'",
    "'BAKE & BITE'": "'Bake & Bite'",
    "'ESSN'": "'Essn'",
    "'CMH'": "'Cmh / Bns / Bsh'",
    "'SICK REPORT'": "'Sick Report'",
    "'ATT/TDY/DETT'": "'Att/Tdy/Dett'",
    "'RECEPTION'": "'Reception / K/O'",
    "'AIR FD DUTY'": "'Air Fd Duty'",
    "'ADMIN ORDER'": "'Admin Order'",
    "'CLASS/TRG'": "'Class / Trg'",
    "'DRILL CAT-C'": "'Drill Cat-C'",
    "otherDisposals[0].title.toUpperCase()": "formatRunningLetter(otherDisposals[0].title)",
    "'DUTY ON'": "'Duty On'",
    "'DUTY OFF'": "'Duty Off'",
    "'GAMES'": "'Games'",
    "'ABSENT'": "'Absent'",
    "otherDisposals[odIdx].title.toUpperCase()": "formatRunningLetter(otherDisposals[odIdx].title)"
}

for old, new in replacements.items():
    content = content.replace(old, new)

# And onParade list inside the component
# ${idx + 1}. ${a.rank} ${a.name} -> ${idx + 1}. ${formatRunningLetter(a.rank)} ${formatRunningLetter(a.name)}
content = content.replace(
    "`${idx + 1}. ${a.rank} ${a.name}`",
    "`${idx + 1}. ${formatRunningLetter(a.rank)} ${formatRunningLetter(a.name)}`"
)

content = content.replace(
    "`${i + 1}. ${col1Item.rank} ${col1Item.name}`",
    "`${i + 1}. ${formatRunningLetter(col1Item.rank)} ${formatRunningLetter(col1Item.name)}`"
)
content = content.replace(
    "`${16 + i}. ${col2Item.rank} ${col2Item.name}`",
    "`${16 + i}. ${formatRunningLetter(col2Item.rank)} ${formatRunningLetter(col2Item.name)}`"
)
content = content.replace(
    "`${31 + i}. ${col3Item.rank} ${col3Item.name}`",
    "`${31 + i}. ${formatRunningLetter(col3Item.rank)} ${formatRunningLetter(col3Item.name)}`"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated docxExport.ts contents")
