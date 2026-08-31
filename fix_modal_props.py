import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

start_modal = code.find('<PrintableNightCountModal')
end_modal = code.find('/>', start_modal)

if start_modal != -1 and end_modal != -1:
    new_props = """<PrintableNightCountModal
          role={role}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          airmen={airmen}
          onClose={() => setIsInternalPrintOpen(false)}
        />"""
    code = code[:start_modal] + new_props + code[end_modal + 2:]
    with open('src/components/NightCountStateView.tsx', 'w') as f:
        f.write(code)
    print("Fixed modal props in view.")
