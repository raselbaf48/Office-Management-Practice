import os
import re

file_path = 'src/components/AddEditAirmanModal.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Change livingType initialization
code = code.replace(
    "const [livingType, setLivingType] = useState<'L_IN' | 'L_OUT'>(() => {",
    "const [livingType, setLivingType] = useState<'L_IN' | 'L_OUT' | null>(() => {"
)
code = code.replace(
    "return 'L_IN';\n  });",
    "return null;\n  });"
)
code = code.replace(
    "if (lower.includes('qtr') || lower.includes('quarter') || lower.includes('outside')) {",
    "if (lower.includes('qtr') || lower.includes('quarter') || lower.includes('outside') || lower.includes('maizpara')) {"
)

# Handle null livingType check in validation
code = code.replace(
    "if (livingType === 'L_IN' && !blockNo.trim()) return setValidationError('Please enter Block No for Live-In address');",
    """if (!livingType) return setValidationError('Please select Living Status (L/In or L/Out)');
    if (livingType === 'L_IN' && !blockNo.trim()) return setValidationError('Please enter Block No for Live-In address');"""
)

# Handle outsideAddress initialization (to catch Maizpara in L/Out)
code = code.replace(
    "if (airmanToEdit?.addressBlock && airmanToEdit.addressBlock.toLowerCase().includes('outside')) {",
    "if (airmanToEdit?.addressBlock && (airmanToEdit.addressBlock.toLowerCase().includes('outside') || airmanToEdit.addressBlock.toLowerCase().includes('maizpara'))) {"
)

with open(file_path, 'w') as f:
    f.write(code)

print("AddEditAirmanModal updated")
