import re

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace formatListStr implementation
old_str = r'const formatListStr = \(items: typeof pList\) =>\s*items\.length > 0\s*\?\s*items\s*\.map\(\(it, idx\) => `\$\{idx \+ 1\}\. \$\{it\.airman\.rank\} \$\{it\.airman\.name\}`\)\s*\.join\(\'\\n\'\)\s*:\s*\';'

# We'll do a simple replace
content = content.replace(
    "const formatListStr = (items: typeof pList) =>\n              items.length > 0\n                ? items\n                    .map((it, idx) => `${idx + 1}. ${it.airman.rank} ${it.airman.name}`)\n                    .join('\\n')\n                : '-';",
    "const formatListStr = (items: typeof pList) =>\n              items.length > 0\n                ? items\n                    .map((it, idx) => `${idx + 1}. ${formatAirmanName(it.airman.rank)} ${formatAirmanName(it.airman.name)}`)\n                    .join('\\n')\n                : '-';"
)

# And if it didn't match perfectly, let's use regex
content = re.sub(
    r'\.map\(\(it, idx\) => `\$\{idx \+ 1\}\. \$\{it\.airman\.rank\} \$\{it\.airman\.name\}`\)',
    r'.map((it, idx) => `${idx + 1}. ${formatAirmanName(it.airman.rank)} ${formatAirmanName(it.airman.name)}`)',
    content
)

# Moving Download Document Option into Official Export / Print Modal
# In PrintableParadeStateModal.tsx we need to pass a button or pass handleDownloadDocx to it.
# We'll just remove the Download Document button from ParadeStateFormattedView.tsx and place it inside PrintableParadeStateModal.tsx.
# But wait, PrintableParadeStateModal.tsx doesn't have the context of `handleDownloadDocx`.
# So we can pass `onDownloadDocx={handleDownloadDocx}` to `<PrintableParadeStateModal />` inside `ParadeStateFormattedView.tsx`.

content = re.sub(
    r'<PrintableParadeStateModal\s*userFlight=\{userFlight\}',
    r'<PrintableParadeStateModal\n              onDownloadDocx={handleDownloadDocx}\n              userFlight={userFlight}',
    content
)

# Remove the Download Document button from ParadeStateFormattedView.tsx
button_pattern = r'\{\/\* Download Document Button \*\/\}[\s\S]*?<\/button>'
content = re.sub(button_pattern, '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ParadeStateFormattedView.tsx")
