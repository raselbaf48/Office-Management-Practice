import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# exportParadeStateSingleDocx
content = content.replace("const leftSigRank = formatRunningLetter(params.leftSig?.rank || 'Sgt');", "const leftSigRank = params.leftSig?.rank || 'Sgt';")
content = content.replace("const rightSigRank = formatRunningLetter(params.rightSig?.rank || 'FLT LT');", "const rightSigRank = params.rightSig?.rank || 'FLT LT';")

# exportParadeStateMultiDocx
content = content.replace("const lSigRank = formatRunningLetter(leftSig?.rank || 'Sgt');", "const lSigRank = leftSig?.rank || 'Sgt';")
content = content.replace("const rSigRank = formatRunningLetter(rightSig?.rank || 'FLT LT');", "const rSigRank = rightSig?.rank || 'FLT LT';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted signature rank formatting in docxExport.ts")
