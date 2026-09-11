import re

def modify_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# DashboardParadeState.tsx
modify_file('src/components/DashboardParadeState.tsx', [
    ("dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })",
     "dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(/Sept/gi, 'Sep')")
])

# EntryHistoryModal.tsx
modify_file('src/components/EntryHistoryModal.tsx', [
    ("dt.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' })",
     "dt.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: '2-digit' }).replace(/Sept/gi, 'Sep')")
])

# PrintableFlyingWingModal.tsx
modify_file('src/components/PrintableFlyingWingModal.tsx', [
    ("new Date(date).toLocaleDateString(\"en-GB\", {day:\"2-digit\", month:\"short\", year: '2-digit'})",
     "new Date(date).toLocaleDateString(\"en-GB\", {day:\"2-digit\", month:\"short\", year: '2-digit'}).replace(/Sept/gi, 'Sep')")
])

# FlyingWingStateView.tsx
modify_file('src/components/FlyingWingStateView.tsx', [
    ("d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })",
     "d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/Sept/gi, 'Sep')")
])

# IdaCenterDutyView.tsx
modify_file('src/components/IdaCenterDutyView.tsx', [
    ("now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })",
     "now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' }).replace(/Sept/gi, 'Sep')"),
    ("dObj.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' })",
     "dObj.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: '2-digit' }).replace(/Sept/gi, 'Sep')")
])

# utils/authSession.ts
modify_file('src/utils/authSession.ts', [
    ("month: 'short',",
     "month: 'short',"),
    ("    }).replace(',', '');",
     "    }).replace(',', '').replace(/Sept/gi, 'Sep');")
])

print("Fixed all toLocaleDateString formats!")
