import os
import re

file_path = 'src/components/Sidebar.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Remove {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
code = code.replace("{(role === 'ADMIN' || role === 'SUPER_ADMIN') && (", "{true && (")

with open(file_path, 'w') as f:
    f.write(code)

print("Sidebar restrictions removed")
