import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    if lines[i] == '      </div>\n' and i+1 < len(lines) and lines[i+1].strip() == '};':
        # only keep if it's the very last };
        # check if there are any }; after this one
        has_more = False
        for j in range(i+2, len(lines)):
            if lines[j].strip() == '};':
                has_more = True
                break
        if has_more:
            i += 1
            continue
    out.append(lines[i])
    i += 1

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
