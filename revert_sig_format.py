import re
import glob

for file_path in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('{formatAirmanName(preparedBy.rank)}', '{preparedBy.rank}')
    content = content.replace('{formatAirmanName(authorizedBy.rank)}', '{authorizedBy.rank}')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Reverted signature rank formatting in UI components")
