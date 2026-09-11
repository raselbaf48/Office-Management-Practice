import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a helper function at the top
helper_func = """
const formatRunningLetter = (text: string) => {
  if (!text) return '';
  return text.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
"""

# Find a good place to insert it. After imports.
content = re.sub(r'(import .*?;?\n)\n(export interface)', r'\1\n' + helper_func + r'\n\2', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated docxExport.ts imports")
