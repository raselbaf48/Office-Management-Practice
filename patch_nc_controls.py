import re

file_path = 'src/components/NightCountStateView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the heading with single quotes
content = content.replace(
    """<h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:text-black mt-1">
            'Night Count State'
          </h1>""",
    """<h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:text-black mt-1">
            Night Count State Controls
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage night count date, personnel state and display settings
          </p>"""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Night Count State controls text.")
