import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# Replace rawList definition
new_raw_list = """const rawList = (singleParadeData?.personnelStatusList || []).filter(item => {
    const a = item.airman;
    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
  });
  const statusList = selectedFlight === 'Overall'
    ? rawList
    : rawList.filter((item) => item.airman.flightName === selectedFlight);"""

code = re.sub(
    r"const rawList = singleParadeData\?\.personnelStatusList;\s*const statusList = rawList\s*\?\s*selectedFlight === 'Overall'\s*\?\s*rawList\s*:\s*rawList\.filter\(\(item\) => item\.airman\.flightName === selectedFlight\)\s*:\s*null;",
    new_raw_list,
    code
)

code = code.replace("if (statusList) {", "if (statusList && statusList.length > 0) {")

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
