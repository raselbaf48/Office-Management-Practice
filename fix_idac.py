import os

file_path = 'src/data/idacSettings.ts'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(
    "if (upper.includes('AC')) return 7;",
    "if (upper.includes('AC-1') || upper.includes('AC1')) return 7;\n  if (upper.includes('AC')) return 8;"
)

with open(file_path, 'w') as f:
    f.write(code)

print("IDAC updated")
