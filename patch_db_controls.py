import re

file_path = 'src/components/DashboardParadeState.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    """<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              155 UASU BAF • Operations Dashboard
            </h1>""",
    """<h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Operations Dashboard Controls
            </h1>"""
)

content = content.replace(
    """<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {dayName}, {dateDisplay} • Unit Strength: {data?.summary?.totalStrength || 48} Airmen
          </p>""",
    """<p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage unit operations, date selection, and personnel metrics
          </p>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            {dayName}, {dateDisplay} • Unit Strength: {data?.summary?.totalStrength || 48} Airmen
          </p>"""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Dashboard controls text.")
