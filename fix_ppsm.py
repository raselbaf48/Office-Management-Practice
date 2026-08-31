import re

file_path = 'src/components/PrintableParadeStateModal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# For PrintableParadeStateModal, the disposal names might be in div with uppercase
div_pattern = re.compile(r'(<div className="[^"]*)uppercase([^"]*">)(Leave|Duty On|Duty Off|Bake & Bite|Det/Tdy|Reception|IDAC|Morning IDAC|Sick Report|Admin Order|Class / Trg|Drill Cat-C|G/H & Games|Absent)')
content = div_pattern.sub(r'\1capitalize\2\3', content)

with open(file_path, 'w') as f:
    f.write(content)
print("PrintableParadeStateModal divs updated")
