import re

file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Shield import
content = re.sub(r'(\bCalendar\b)', r'\1, Shield', content, count=1)

# Replace the control banner
old_banner = """<div className="flex items-center space-x-3">
 <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg shrink-0">
 <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div>
 <h2 className="text-sm font-bold text-slate-900 dark:text-white ">{isPtDocument ? 'PT State Controls' : 'Parade State Controls'}</h2>
 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Manage {isPtDocument ? 'PT' : 'parade'} date, flight and display settings</p>
 </div>
 </div>"""

new_banner = """<div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>155 UASU BAF • Daily {isPtDocument ? 'PT' : 'Parade'} State</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:text-black mt-1">
            {isPtDocument ? 'PT State Controls' : 'Parade State Controls'}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage {isPtDocument ? 'PT' : 'parade'} date, flight and display settings
          </p>
        </div>"""

content = content.replace(old_banner, new_banner)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Parade/PT State controls to match Night Count State.")
