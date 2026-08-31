import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# Replace handleDownloadDocx implementation
start_func = code.find('const handleDownloadDocx = async () => {')
end_func = code.find('};\n\n  // Render Custom Modals', start_func) + 2

new_func = """const handleDownloadDocx = () => {
    window.print();
  };"""

code = code[:start_func] + new_func + code[end_func:]

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
