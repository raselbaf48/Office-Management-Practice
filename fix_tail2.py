import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

out = []
for line in lines:
    if line.strip() == '<PrintableDutyRatioModal':
        break
    out.append(line)

out.append('        <PrintableDutyRatioModal\n')
out.append('          matrix={matrix}\n')
out.append('          selectedFlightFilter={selectedFlightFilter}\n')
out.append('          onClose={() => setIsPrintModalOpen(false)}\n')
out.append('        />\n')
out.append('      )}\n')
out.append('    </div>\n')
out.append('  );\n')
out.append('};\n')

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
