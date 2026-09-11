import sys
import glob

for filename in glob.glob('src/components/*.tsx'):
    with open(filename, 'r') as f:
        code = f.read()
    
    if "|| 'Duty Off'" in code:
        code = code.replace("|| 'Duty Off'", "|| 'GD Off'")
        with open(filename, 'w') as f:
            f.write(code)
        print(f'Replaced in {filename}')

