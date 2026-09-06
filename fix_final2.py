import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip() == '}':
        # wait
        pass
    
    # Check for the end of settings modal
    if "      )}" in line and i > 0 and '        </div>' in lines[i-1] and 'Save & Close' in ''.join(lines[i-15:i]):
        out.append('          </div>\n')
        out.append('        </div>\n')
        out.append(line)
        i += 1
        continue
    
    # Remove the garbage div after settings modal
    if "          </div>\n" == line and i > 0 and "      )}\n" == lines[i-1]:
        i += 1
        continue

    out.append(line)
    i += 1

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(out)
