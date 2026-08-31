import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# Replace tempPList definition inside table render
new_temp_list = """let tempPList = (singleParadeData?.personnelStatusList || []).filter(item => {
                    const a = item.airman;
                    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
                    const block = (a.addressBlock || '').toLowerCase();
                    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
                  });
                  if (selectedFlight !== 'Overall') {
                    tempPList = tempPList.filter(p => p.airman.flightName === selectedFlight);
                  }"""

# It appears twice (one for single day, one for multi day? Oh multi day might have a loop but single day table has it for sure). Wait, multi-day table iterates.
# Actually I replaced BOTH single day and multi day tables with `new_table` previously! So there are two instances of `let tempPList = ...`.
code = re.sub(r"let tempPList = selectedFlight === 'Overall' \? \(singleParadeData\?\.personnelStatusList \|\| \[\]\) : \(singleParadeData\?\.personnelStatusList \|\| \[\]\)\.filter\(\(p\) => p\.airman\.flightName === selectedFlight\);", new_temp_list, code)

with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)
print("Done")
