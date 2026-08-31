import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# 1. Remove the Multi Date toggle completely
start_toggle = code.find('<div className="flex items-center space-x-1 bg-white')
end_toggle = code.find('</div>\n                </div>', start_toggle)

code = code[:start_toggle] + code[end_toggle:]

# 2. Make the Date picker unconditional (instead of checking disposalDateMode)
code = code.replace("{disposalDateMode === 'SINGLE' ? (", "")
start_else = code.find(') : (\n                  <div className="grid grid-cols-2 gap-3">')
end_else = code.find('</div>\n                )}')
if start_else != -1:
    code = code[:start_else] + code[end_else + 22:]

# Also fix the duplicate state declarations! Why is it declaring everything twice?
# Let's check why there are duplicate declarations (e.g. lines 105 and 676).
# Ah, I might have messed up with grep, there is only one component probably but grep showed two hits?
# Wait, NightCountStateView had two huge sections of identical states? Let's check file lines.
