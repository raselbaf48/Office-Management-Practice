with open("src/components/Sidebar.tsx", "r") as f:
    data = f.read()
data = data.replace(") : (\n)}", ")}")
data = data.replace(") : (\n  )}", ")}")
data = data.replace(") : (\n)}", ")}")
import re
data = re.sub(r"\)\s*:\s*\(\s*\)\}", ")}", data)
with open("src/components/Sidebar.tsx", "w") as f:
    f.write(data)
