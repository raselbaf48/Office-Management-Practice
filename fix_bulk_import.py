import os

file_path = 'src/components/BulkImportAirmenModal.tsx'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(
    'const rawAddress = getVal(addressIdx, "Airmen\'s Mess");',
    'const rawAddress = getVal(addressIdx, "");'
)
code = code.replace(
    'addressBlock: r.addressBlock.trim() || "Airmen\'s Mess",',
    'addressBlock: r.addressBlock.trim(),'
)

with open(file_path, 'w') as f:
    f.write(code)

print("Bulk import fixed")
