import re

files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableParadeStateModal.tsx'
]

apply_btn = """              <button
                type="button"
                onClick={() => handleSaveEditDisposal()}
                disabled={editDisposalLoading || !editDisposalCategory || (editDisposalCategory === 'OTHERS' && !editDisposalCustomTitle.trim())}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                {editDisposalLoading ? 'Applying...' : 'Apply Changes'}
              </button>"""

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if we already have an Apply Changes button to avoid duplicates
    if 'Apply Changes' in content:
        print(f"Skipping {file_path}, already has Apply Changes button")
        continue

    # Find the Cancel button in Modal Action Buttons block
    # Since there might be other Cancel buttons, we should be careful. 
    # But it's easier to find the specific one inside Edit Modal. 
    # Let's search for "setEditDisposalModal(null)" and the subsequent Cancel text.
    
    pattern = r'(onClick=\{\(\) => setEditDisposalModal\(null\)\}.*?Cancel\s*</button>)'
    
    new_content, count = re.subn(pattern, r'\1\n' + apply_btn, content, flags=re.DOTALL)
    
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"Failed to match Cancel button in {file_path}")
