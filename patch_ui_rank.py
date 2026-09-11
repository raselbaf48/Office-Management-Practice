import re
import glob

def patch_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace {item.airman.rank} with {formatAirmanName(item.airman.rank)}
    # and {a.rank} with {formatAirmanName(a.rank)}
    # but only inside TSX files where formatAirmanName is available or we add it.

    # First, let's just do it in ParadeStateFormattedView.tsx
    if "ParadeStateFormattedView" in file_path:
        content = content.replace('{item.airman.rank}', '{formatAirmanName(item.airman.rank)}')
        content = content.replace('{a.rank}', '{formatAirmanName(a.rank)}')
        content = content.replace('{editDisposalModal.airman.rank}', '{formatAirmanName(editDisposalModal.airman.rank)}')
        content = content.replace('{preparedBy.rank}', '{formatAirmanName(preparedBy.rank)}')
        content = content.replace('{authorizedBy.rank}', '{formatAirmanName(authorizedBy.rank)}')
        content = content.replace('{activeEditCell.airman.rank}', '{formatAirmanName(activeEditCell.airman.rank)}')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

patch_file('src/components/ParadeStateFormattedView.tsx')
