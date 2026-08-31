import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# Replace NightCountStateView with PrintableNightCountModal
code = code.replace('export const NightCountStateView: React.FC<NightCountStateViewProps> = ({', 'export const PrintableNightCountModal: React.FC<NightCountStateViewProps & { onClose: () => void }> = ({\n  onClose,\n')

start_banner = code.find('{/* Top Controls Banner (Hidden during print) */}')
end_banner = code.find('{/* OFFICIAL PARADE DOCUMENT SHEET (DISPLAYED ON SCREEN & IN PRINT) */}')

modal_controls = """
      {/* MODAL OVERLAY */}
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-sm overflow-hidden print:bg-white print:block">
        
        {/* MODAL HEADER - HIDDEN ON PRINT */}
        <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-white">Print Preview</h2>
              <p className="text-xs font-medium text-slate-400">Night Count State</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE DOCUMENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:overflow-visible print:block">
          {/* THE ACTUAL DOCUMENT */}
          <div className="bg-white text-black shadow-2xl print:shadow-none w-[297mm] min-h-[210mm] relative mx-auto print:mx-0 print:w-full print:min-h-0 shrink-0">
"""

code = code[:start_banner] + modal_controls + code[end_banner:]

# Find the final closing of the component
end_div = code.rfind('    </div>\n  );\n};')
if end_div != -1:
    code = code[:end_div] + '          </div>\n        </div>\n      </div>\n    </div>\n  );\n};'
else:
    print("Could not find end div!")

# Safely delete recursive print modal inside the new file
code = re.sub(r'\{\/\* Internal Printable Parade State Modal \(Fallback\) \*\/\}.*?isInternalPrintOpen && \(\s*<PrintableNightCountModal.*?/>\s*\)\s*\}', '', code, flags=re.DOTALL)

with open('src/components/PrintableNightCountModal.tsx', 'w') as f:
    f.write(code)
print("Done")
