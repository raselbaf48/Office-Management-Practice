import re
file_path = 'src/components/ParadeStateFormattedView.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add state
if 'const [activePreset, setActivePreset] = useState' not in content:
    content = content.replace("const [selectedDate, setSelectedDate] = useState", "const [activePreset, setActivePreset] = useState<'today' | '7days' | '15days' | 'month' | 'custom'>('today');\n  const [selectedDate, setSelectedDate] = useState")

# Update handleSetPreset
content = content.replace("const handleSetPreset = (type: 'today' | '7days' | '15days' | 'month') => {", "const handleSetPreset = (type: 'today' | '7days' | '15days' | 'month') => {\n    setActivePreset(type);")

# Update fromDate input
content = content.replace("""onChange={(e) => {
                      setFromDate(e.target.value);
                      if (!isMultiDay) setToDate(e.target.value);
                    }}""", """onChange={(e) => {
                      setFromDate(e.target.value);
                      if (!isMultiDay) setToDate(e.target.value);
                      setActivePreset('custom');
                    }}""")
content = content.replace("""onChange={(e) => {
                      setFromDate(e.target.value);
                      setToDate(e.target.value);
                      setSelectedDate(e.target.value);
                    }}""", """onChange={(e) => {
                      setFromDate(e.target.value);
                      setToDate(e.target.value);
                      setSelectedDate(e.target.value);
                      setActivePreset('custom');
                    }}""")

# Update toDate input
content = content.replace("""onChange={(e) => setToDate(e.target.value)}""", """onChange={(e) => { setToDate(e.target.value); setActivePreset('custom'); }}""")

# Update the buttons
buttons_code = """              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => handleSetPreset('today')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activePreset === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleSetPreset('7days')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activePreset === '7days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleSetPreset('15days')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activePreset === '15days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  15 Days
                </button>
                <button
                  onClick={() => handleSetPreset('month')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activePreset === 'month' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Month
                </button>
              </div>"""

# Replace the block
block_to_replace = re.search(r'<div className="flex items-center bg-slate-100[^>]+>[\s\S]*?</div>', content)
if block_to_replace:
    content = content[:block_to_replace.start()] + buttons_code + content[block_to_replace.end():]

with open(file_path, 'w') as f:
    f.write(content)
print("Presets fixed")
