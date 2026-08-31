import re

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix the H1 title in the non-print view
content = content.replace(
    "{isPtDocument ? 'Daily PT State' : 'Parade State Document'}",
    "{isPtDocument ? 'PT State' : 'Parade State'}"
)

# Replace 'uppercase' class on the H3 elements for the categories
h3_pattern = re.compile(r'(<h3 className="[^"]*)uppercase([^"]*">)')
content = h3_pattern.sub(r'\1capitalize\2', content)

# Remove .toUpperCase() where not necessary? Wait, the user specifically mentioned the disposal categories on the lists.
# Let's check where the disposal names are rendered in the lists.
# In ParadeStateFormattedView.tsx and PrintableParadeStateModal.tsx, they are rendered with <h3> or <div> that has uppercase.
with open(file_path, 'w') as f:
    f.write(content)
print("ParadeStateFormattedView H3s updated")
