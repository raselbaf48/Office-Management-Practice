import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

filter_flight_airmen = """const flightAirmen = (fl === 'Overall' ? airmen : airmen.filter((a) => a.flightName === fl)).filter(a => {
    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
});"""

code = code.replace("const flightAirmen = fl === 'Overall' ? airmen : airmen.filter((a) => a.flightName === fl);", filter_flight_airmen)

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
