import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

code = code.replace("import { PrintableParadeStateModal } from './PrintableParadeStateModal';", "import { PrintableNightCountModal } from './PrintableNightCountModal';")
code = code.replace("<PrintableParadeStateModal", "<PrintableNightCountModal")

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
