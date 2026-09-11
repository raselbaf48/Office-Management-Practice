import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# exportDutyRosterDocx
content = re.sub(
    r'createDataCell\(item\.rank,',
    r'createDataCell(formatRunningLetter(item.rank),',
    content
)
content = re.sub(
    r'createDataCell\(item\.name,',
    r'createDataCell(formatRunningLetter(item.name),',
    content
)

# exportNominalRollDocx
content = re.sub(
    r'createArialDataCell\(a\.rank, 1000',
    r'createArialDataCell(formatRunningLetter(a.rank), 1000',
    content
)
content = re.sub(
    r'createArialDataCell\(a\.name, 2200',
    r'createArialDataCell(formatRunningLetter(a.name), 2200',
    content
)

# exportMonthlyDutyRegisterDocx
content = re.sub(
    r'createArialDataCell\(a\.rank, 800',
    r'createArialDataCell(formatRunningLetter(a.rank), 800',
    content
)
content = re.sub(
    r'createArialDataCell\(a\.name, 1800',
    r'createArialDataCell(formatRunningLetter(a.name), 1800',
    content
)

# Signatures in exportParadeStateSingleDocx
content = re.sub(
    r'const leftSigRank = params\.leftSig\?\.rank \|\| \'Sgt\';',
    r'const leftSigRank = formatRunningLetter(params.leftSig?.rank || \'Sgt\');',
    content
)
content = re.sub(
    r'const rightSigRank = params\.rightSig\?\.rank \|\| \'FLT LT\';',
    r'const rightSigRank = formatRunningLetter(params.rightSig?.rank || \'FLT LT\');',
    content
)

# Signatures in exportParadeStateMultiDocx
content = re.sub(
    r'const lSigRank = leftSig\?\.rank \|\| \'Sgt\';',
    r'const lSigRank = formatRunningLetter(leftSig?.rank || \'Sgt\');',
    content
)
content = re.sub(
    r'const rSigRank = rightSig\?\.rank \|\| \'FLT LT\';',
    r'const rSigRank = formatRunningLetter(rightSig?.rank || \'FLT LT\');',
    content
)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated docxExport.ts")
