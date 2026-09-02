import re

files = [
    'src/components/PrintableParadeStateModal.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # preparedBy
    content = re.sub(
        r'<div className="text-\[11px\] font-bold uppercase">\{preparedBy\.rank\}</div>',
        r'<div className="text-[11px] font-normal">{preparedBy.rank}</div>',
        content
    )
    content = re.sub(
        r'<div className="text-\[10px\] font-normal">\{preparedBy\.unit \|\| \'155 UASU BAF\'\}</div>',
        r'<div className="text-[10px] uppercase font-bold">{preparedBy.unit || \'155 UASU BAF\'}</div>',
        content
    )

    # authorizedBy
    content = re.sub(
        r'<div className="text-\[11px\] font-bold uppercase">\{authorizedBy\.rank\}</div>',
        r'<div className="text-[11px] font-normal">{authorizedBy.rank}</div>',
        content
    )
    content = re.sub(
        r'<div className="text-\[10px\] font-normal">\{authorizedBy\.unit \|\| \'155 UASU BAF\'\}</div>',
        r'<div className="text-[10px] uppercase font-bold">{authorizedBy.unit || \'155 UASU BAF\'}</div>',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

print("Patch applied to all other files")
