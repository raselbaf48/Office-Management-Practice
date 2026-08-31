import os
import re
import glob

def replace_in_file(filepath):
    if not os.path.isfile(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Types
    content = content.replace("'MWO' | 'SWO' | 'WO' | 'SGT' | 'Sgt' | 'CPL' | 'Cpl' | 'LAC' | 'AC'", "'MWO' | 'SWO' | 'WO' | 'Sgt' | 'Cpl' | 'LAC' | 'AC-1' | 'AC-2'")
    content = content.replace("['MWO', 'SWO', 'WO', 'SGT', 'CPL', 'LAC', 'AC']", "['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']")
    content = content.replace("['All', 'MWO', 'SWO', 'WO', 'SGT', 'CPL', 'LAC', 'AC']", "['All', 'MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']")
    content = content.replace("MWO, SWO, WO, SGT, CPL, LAC, AC", "MWO, SWO, WO, Sgt, Cpl, LAC, AC-1, AC-2")

    # Specific rank checks
    content = content.replace("['MWO', 'SWO', 'WO', 'SGT', 'Sgt']", "['MWO', 'SWO', 'WO', 'Sgt']")
    content = content.replace("['SGT', 'CPL', 'LAC', 'AC']", "['Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']")
    
    content = content.replace("rank: 'SGT'", "rank: 'Sgt'")
    content = content.replace("rank: 'CPL'", "rank: 'Cpl'")
    content = content.replace("rank: 'AC'", "rank: 'AC-1'")
    
    content = content.replace("rank || 'SGT'", "rank || 'Sgt'")
    content = content.replace("leftSig?.rank || 'SGT'", "leftSig?.rank || 'Sgt'")
    content = content.replace("leftSigRank = params.leftSig?.rank || 'SGT'", "leftSigRank = params.leftSig?.rank || 'Sgt'")

    # Seniority mapping
    content = re.sub(r'SGT:\s*4,', r'Sgt: 4,', content)
    content = re.sub(r'CPL:\s*5,', r'Cpl: 5,', content)
    content = re.sub(r'LAC:\s*6,', r'LAC: 6,', content)
    content = re.sub(r'AC:\s*7,', r'LAC: 6,\n  "AC-1": 7,\n  "AC-2": 8,', content)
    
    content = content.replace("return 'SGT'", "return 'Sgt'")
    content = content.replace("return 'CPL'", "return 'Cpl'")
    
    # AirmanMatcher
    content = content.replace("return { rank: 'SGT', valid: true }", "return { rank: 'Sgt', valid: true }")
    content = content.replace("return { rank: 'CPL', valid: true }", "return { rank: 'Cpl', valid: true }")
    content = content.replace("return { rank: 'AC', valid: true }", "return { rank: 'AC-1', valid: true }")
    content = content.replace("['SGT', 'Sazzad", "['Sgt', 'Sazzad")

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file))

print("Ranks updated")
