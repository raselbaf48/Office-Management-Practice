import os
import re

file_path = 'src/components/MonthlyDutyRegister.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Pattern to remove the button
pattern = r'<button[^>]*handleClearDatabase[^>]*>.*?Erase Duty DB.*?<\/button>'
code = re.sub(pattern, '', code, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(code)

print("Erase button removed")
