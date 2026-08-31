import os
import re

file_path = 'src/utils/airmanMatcher.ts'
with open(file_path, 'r') as f:
    code = f.read()

# Fix detectRankFromText
code = code.replace(
    "if (/\\b(?:ac|aircraftman|a\\s*c)\\b/i.test(lower)) return 'AC';",
    """if (/\\b(?:ac-1|ac 1|ac1)\\b/i.test(lower)) return 'AC-1';
  if (/\\b(?:ac-2|ac 2|ac2|ac|aircraftman|a\\s*c)\\b/i.test(lower)) return 'AC-2';"""
)

# Fix cleanAirmanNameFromText
code = code.replace(
    "\\b(?:mwo|swo|flt\\s*sgt|f\\/sgt|wo|sgt|cpl|lac|ac)\\b",
    "\\b(?:mwo|swo|flt\\s*sgt|f\\/sgt|wo|sgt|cpl|lac|ac-1|ac-2|ac1|ac2|ac)\\b"
)

# Fix normalizeRank
code = code.replace(
    "if (r === 'AC' || r === 'AIRCRAFTMA') return 'AC-1';",
    ""
)
code = code.replace(
    "if (r === 'AC' || r === 'AIRCRAFTMA') return 'AC';",
    """if (r === 'AC-1' || r === 'AC1') return 'AC-1';
  if (r === 'AC-2' || r === 'AC2' || r === 'AC' || r === 'AIRCRAFTMA') return 'AC-2';"""
)

with open(file_path, 'w') as f:
    f.write(code)

print("Matcher updated")
