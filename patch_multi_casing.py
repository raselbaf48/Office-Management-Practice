import re

file_path = 'src/utils/docxExport.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For multi day we might have something like `displayName = ${p.rank} ${p.name}` or similar mapping
# Let's replace any instance of `${a.rank} ${a.name}` or `${p.rank} ${p.name}` or similar in docxExport.ts

content = re.sub(
    r'\`\$\{([a-zA-Z0-9_]+)\.rank\} \$\{([a-zA-Z0-9_]+)\.name\}\`',
    r'`${formatRunningLetter(\1.rank)} ${formatRunningLetter(\2.name)}`',
    content
)

# And if there are names with note like `${p.rank} ${p.name} - ${note}`
content = re.sub(
    r'\`\$\{([a-zA-Z0-9_]+)\.rank\} \$\{([a-zA-Z0-9_]+)\.name\} - \$\{([a-zA-Z0-9_]+)\}\`',
    r'`${formatRunningLetter(\1.rank)} ${formatRunningLetter(\2.name)} - ${\3}`',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
