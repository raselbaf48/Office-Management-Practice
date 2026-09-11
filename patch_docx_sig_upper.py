import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For Single Parade State Document Signature
content = content.replace("text: leftSigRank.toUpperCase(),", "text: leftSigRank,")
content = content.replace("text: rightSigRank.toUpperCase(),", "text: rightSigRank,")

# For Multi Parade State Document Signature
content = content.replace("text: lSigRank.toUpperCase(),", "text: lSigRank,")
content = content.replace("text: rSigRank.toUpperCase(),", "text: rSigRank,")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed .toUpperCase() from docxExport.ts signature rank variables")
