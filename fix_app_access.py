import os
import re

file_path = 'src/App.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Remove the role restrictions from handleRoleChange
code = re.sub(r"if \(\s*newRole === 'USER' &&\s*activeTab !== 'overview'[\s\S]*?setActiveTab\('overview'\);\s*\}", "", code)

# Remove the useEffect restricting access
code = re.sub(r"// Restrict access for non-admin viewers.*?\s*useEffect\(\(\) => \{[\s\S]*?setActiveTab\('overview'\);\s*\}\s*\}, \[role, activeTab\]\);", "", code)

with open(file_path, 'w') as f:
    f.write(code)

print("App.tsx restrictions removed")
