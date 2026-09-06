import sys

with open('src/components/DutyRatioMatrixView.tsx', 'r') as f:
    lines = f.readlines()

# 1. Line 374 before '        )}'
for i, line in enumerate(lines):
    if line.startswith('        )}') and 'Flight Filter:' in ''.join(lines[i-20:i]):
        lines.insert(i, '          </div>\n')
        break

# 2. Line 682 before '        )}' (the one for selectedFlightFilter !== 'Overall')
for i, line in enumerate(lines):
    if line.startswith('        )}') and '            </div>\n' not in lines[i-1]:
        # we need to insert two divs
        if '</table>' in lines[i-1]:
            lines.insert(i, '            </div>\n          </div>\n')
            break

# 3. End of file: we need 4 divs before ');'
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == ');':
        # check how many divs are before it
        div_count = 0
        j = i - 1
        while j >= 0 and '</div>' in lines[j]:
            div_count += 1
            j -= 1
        
        while div_count < 4:
            lines.insert(i, '      </div>\n')
            div_count += 1
            i += 1
        break

with open('src/components/DutyRatioMatrixView.tsx', 'w') as f:
    f.writelines(lines)
