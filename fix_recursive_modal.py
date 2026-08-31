with open('src/components/PrintableNightCountModal.tsx', 'r') as f:
    code = f.read()

start_modal = code.find('{/* Internal Printable Parade State Modal (Fallback) */}')
end_modal = code.find(')}', start_modal)

if start_modal != -1 and end_modal != -1:
    code = code[:start_modal] + code[end_modal + 2:]
    with open('src/components/PrintableNightCountModal.tsx', 'w') as f:
        f.write(code)
    print("Fixed recursive modal.")
