import re
with open('src/components/SettingsModal.tsx', 'r') as f:
    content = f.read()

# Remove Activity from all imports
content = content.replace("Activity, ", "")
content = content.replace(" Activity ", " ")

# Put Activity back to lucide-react import
content = re.sub(
    r"import \{([^}]*)\} from 'lucide-react';",
    r"import {\1, Activity} from 'lucide-react';",
    content
)

with open('src/components/SettingsModal.tsx', 'w') as f:
    f.write(content)
