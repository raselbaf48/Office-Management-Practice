with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

bad_index = code.find('};\n  const handleDownloadDocx = () => {\n    window.print();\n  };mport { DateNavigator }')
if bad_index == -1:
    # try another way to find it
    bad_index = code.find('  };mport { DateNavigator }')

if bad_index != -1:
    top_half = code[:bad_index + 4] # just after `};\n`
    
    bottom_half_start = code.find('  // Compute Flight Stats for Single-Day Summary Matrix', bad_index + 4)
    if bottom_half_start != -1:
        clean_code = top_half + '\n' + code[bottom_half_start:]
        with open('src/components/NightCountStateView.tsx', 'w') as f:
            f.write(clean_code)
        print("Restored successfully.")
    else:
        print("Could not find bottom half.")
else:
    print("Could not find bad index.")
