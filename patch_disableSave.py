import sys

with open('src/firebase.ts', 'r') as f:
    code = f.read()

target = "  if (quotaExceeded) return false;"
replacement = "  if (quotaExceeded) return false;\n  \n  // Check if we are in a testing environment (AI Studio)\n  if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {\n    return 'SIMULATED';\n  }"

if target in code:
    code = code.replace(target, replacement)
    print("Replaced!")
else:
    print("Target not found!")

with open('src/firebase.ts', 'w') as f:
    f.write(code)

