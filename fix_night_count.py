import os
import re

file_path = 'src/components/NightCountStateView.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Change all role restrictions in NightCountStateView to allow USER to edit too
code = re.sub(r"\(role === 'ADMIN' \|\| role === 'SUPER_ADMIN'\)", "true", code)
code = re.sub(r"role === 'ADMIN' \|\| role === 'SUPER_ADMIN'", "true", code)

with open(file_path, 'w') as f:
    f.write(code)

print("NightCountStateView role restrictions removed")
