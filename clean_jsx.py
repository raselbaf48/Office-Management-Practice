import re

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if "          </div>" in line and "                          )}" in lines[min(i+1, len(lines)-1)]:
        # Skip this garbage div
        i += 1
        continue
    out.append(line)
    i += 1

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
