with open("src/components/Sidebar.tsx", "r") as f:
    data = f.read()
data = data.replace(") : ()}", ")}")
with open("src/components/Sidebar.tsx", "w") as f:
    f.write(data)
