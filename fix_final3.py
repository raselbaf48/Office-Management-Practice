import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if "p-4 border-t border-slate-200 dark:border-slate-800" in line:
        out.append('            </div>\n')
    
    out.append(line)
    i += 1

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
