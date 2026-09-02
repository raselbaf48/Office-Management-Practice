import re
import fs

with open('src/components/PrintableParadeStateModal.tsx', 'r') as f:
    content = f.read()

# 1. Add hideEmptyColumns state
content = re.sub(
    r"(const \[fromDate, setFromDate\] = useState<string>\(date\);\n  const \[toDate, setToDate\] = useState<string>\(date\);)",
    r"\1\n  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);",
    content
)

# 2. Add hideEmptyColumns checkbox to UI (only if isMultiDay)
checkbox_ui = """
          {isMultiDay && (
            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 ml-4 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 cursor-pointer accent-emerald-600" 
                checked={hideEmptyColumns}
                onChange={(e) => setHideEmptyColumns(e.target.checked)}
              />
              <span>Hide Empty Columns</span>
            </label>
          )}
          <button
"""
content = content.replace("<button\n            onClick={() => window.print()}", checkbox_ui.strip() + "\n            onClick={() => window.print()}")

# 3. Process Multi Day Custom Disposals (Wait, does PrintableParadeStateModal have the custom disposal logic already? Let me check).
