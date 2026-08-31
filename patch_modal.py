import re

with open('src/components/PrintableNightCountModal.tsx', 'r') as f:
    code = f.read()

code = code.replace('PrintableParadeStateModal', 'PrintableNightCountModal')
code = code.replace('PARADE STATE : AIRMEN', 'NIGHT COUNT STATE : L/IN CPL & BELOW')
code = code.replace('PT STATE : AIRMEN', 'NIGHT COUNT STATE : L/IN CPL & BELOW')
code = code.replace('BAF PARADE STATE', 'BAF NIGHT COUNT STATE')

# Filter L/In Cpl & Below
filter_code = """
  const targetAirmen = airmen.filter((a) => {
    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
  });
"""
code = code.replace("const targetAirmen = airmen;", filter_code)

with open('src/components/PrintableNightCountModal.tsx', 'w') as f:
    f.write(code)
