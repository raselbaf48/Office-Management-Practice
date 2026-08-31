import os

top_header = 'src/components/TopHeader.tsx'
if os.path.exists(top_header):
    with open(top_header, 'r') as f: code = f.read()
    code = code.replace("Night Count State (L/In Cpl & Below)", "Night Count State (Airmen)")
    with open(top_header, 'w') as f: f.write(code)

sidebar = 'src/components/Sidebar.tsx'
if os.path.exists(sidebar):
    with open(sidebar, 'r') as f: code = f.read()
    code = code.replace("Night Count State (L/In Cpl & Below)", "Night Count State (Airmen)")
    code = code.replace("Night Count State(L/In Cpl & Below)", "Night Count State (Airmen)")
    with open(sidebar, 'w') as f: f.write(code)

print("Titles updated")
