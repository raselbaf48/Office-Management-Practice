import re

file_path = 'src/components/PrintableNightCountModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'onDownloadDocx?: () => void;' not in content:
    content = re.sub(
        r'onViewAirmanProfile\?: \(airman: Airman\) => void;',
        r'onViewAirmanProfile?: (airman: Airman) => void;\n  onDownloadDocx?: () => void;',
        content
    )
    content = re.sub(
        r'onViewAirmanProfile,\n}\) => \{',
        r'onViewAirmanProfile,\n  onDownloadDocx,\n}) => {',
        content
    )

    if 'Download,' not in content and 'Download ' not in content:
        content = re.sub(
            r'import \{(.*?)\} from \'lucide-react\';',
            r'import {\1, Download} from \'lucide-react\';',
            content
        )

    button_code = """
            {onDownloadDocx && (
              <button
                onClick={onDownloadDocx}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
                title="Download Document"
              >
                <Download className="w-5 h-5" />
                <span>Download Document</span>
              </button>
            )}
"""
    pattern = r'(<button\s+onClick=\{\(\) => \{\s+document\.title = getPdfTitle\(\);\s+window\.print\(\);\s+\}\}\s+className="flex items-center space-x-2 px-6 py-2\.5 bg-emerald-600)'
    content = re.sub(pattern, button_code + r'\1', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated PrintableNightCountModal.tsx")
else:
    print("Already updated PrintableNightCountModal.tsx")
