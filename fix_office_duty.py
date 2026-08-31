import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

new_office_duty = """const officeDutyCount = tempPList.filter(s => {
                    const c = (s.dutyCode || '').toUpperCase();
                    const n = (s.notes || '').toLowerCase();
                    const isOffice = c === 'OFFICE' || n.includes('office');
                    const isIdacB = c === 'IDAC' && s.idaShift === 'Afternoon';
                    const isIdacC = c === 'IDAC' && s.idaShift === 'Night';
                    const isBake = ['BAKE_BITE', 'BAKE_N_BITE'].includes(c) || s.statusCategory === 'BAKE_N_BITE';
                    return isOffice || isIdacB || isIdacC || isBake;
                  }).length;"""

code = re.sub(
    r"const officeDutyCount = tempPList\.filter\(s => s\.dutyCode === 'OFFICE' \|\| s\.notes\?\.toLowerCase\(\)\.includes\('office'\)\)\.length;",
    new_office_duty,
    code
)

# And zero out bakeBiteCount from the table? Actually the user said "IDAC B & C Shift , Bake & Bite er diposal gulo table er Office duty te count hbe".
# Since the column is literally "Mess/ Canteen /Bakery", should it just be `-` ?
# If it's `-`, that's fine. The original `stats.bakeBiteCount` won't be calculated because I put it in `othersCount` in getFlightStats.
# Wait, I didn't increment `bakeBiteCount` in `getFlightStats`! So it will be 0 automatically! Perfect!

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
