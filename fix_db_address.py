import os

file_path = 'src/services/localDatabase.ts'
with open(file_path, 'r') as f:
    code = f.read()

code = code.replace(
    "addressBlock: data.addressBlock || 'Airmen Mess',",
    "addressBlock: data.addressBlock || '',"
)
code = code.replace(
    "addressBlock: item.addressBlock || 'Airmen Mess',",
    "addressBlock: item.addressBlock || '',"
)

with open(file_path, 'w') as f:
    f.write(code)

print("DB address fixed")
