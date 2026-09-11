import re

file_path = 'src/components/PrintableParadeStateModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add onDownloadDocx to props
content = re.sub(
    r'onViewAirmanProfile\?: \(airman: Airman\) => void;',
    r'onViewAirmanProfile?: (airman: Airman) => void;\n  onDownloadDocx?: () => void;',
    content
)

# Add onDownloadDocx to destructuring
content = re.sub(
    r'onViewAirmanProfile,\n}\) => \{',
    r'onViewAirmanProfile,\n  onDownloadDocx,\n}) => {',
    content
)

# Add the Download Document button next to the Official Export / Print button
button_code = """
            {onDownloadDocx && (
              <button
                onClick={onDownloadDocx}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-900/20 transition-all cursor-pointer"
                title="Download Document"
              >
                <Download className="w-5 h-5" />
                <span>Download Document</span>
              </button>
            )}
"""

# Find the Official Export / Print button and insert before it
content = re.sub(
    r'(<button\s+onClick=\{handlePrint\}\s+className="flex items-center space-x-2 px-6 py-2\.5 bg-emerald-600)',
    button_code + r'\n            \1',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PrintableParadeStateModal.tsx")
