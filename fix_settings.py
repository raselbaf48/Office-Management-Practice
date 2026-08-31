import os
import re

file_path = 'src/components/SettingsModal.tsx'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(r'\"', '"')

with open(file_path, 'w') as f:
    f.write(code)
