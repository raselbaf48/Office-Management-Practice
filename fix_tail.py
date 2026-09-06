import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

# find the last ');'
last_idx = -1
for i in range(len(lines)-1, -1, -1):
    if ');' in lines[i]:
        last_idx = i
        break

# we replace everything from last_idx-2 to end with proper closing
out = lines[:last_idx-3]
out.append('    </div>\n')
out.append('  );\n')
out.append('};\n')

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
