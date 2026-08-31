import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

filter_flight = """const flightAirmen = airmen.filter((a) => a.flightName === disposalFlight).filter(a => {
    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
});"""

code = code.replace("const flightAirmen = airmen.filter((a) => a.flightName === disposalFlight);", filter_flight)

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
